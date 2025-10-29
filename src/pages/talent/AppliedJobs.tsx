import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ExternalLink, MapPin, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Swipe } from '@/types/database';

const AppliedJobs = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Swipe[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    await fetchApplications(session.user.id);
    setLoading(false);
  };

  const fetchApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('swipes')
        .select(`
          *,
          jobs(
            *,
            companies(*)
          )
        `)
        .eq('talent_id', userId)
        .eq('direction', 'right')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch applications',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'in_review':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'in_review':
        return 'In Review';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header isAuthenticated userRole="talent" />
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Header isAuthenticated userRole="talent" />
      
      <div className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground text-lg">
            Track the status of your job applications
          </p>
        </div>

        {applications.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start swiping to apply for jobs that interest you
              </p>
              <Button
                className="gradient-primary"
                onClick={() => navigate('/talent/dashboard')}
              >
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <Card key={application.id} className="shadow-card hover:shadow-elevated transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">
                        {application.jobs?.title}
                      </CardTitle>
                      <CardDescription className="text-base flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {application.jobs?.companies?.company_name}
                        </span>
                        {application.jobs?.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {application.jobs.location}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {application.jobs?.job_type}
                        </Badge>
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(application.application_status)}>
                      {getStatusLabel(application.application_status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {application.jobs?.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {application.jobs?.skills_required.slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Applied on {new Date(application.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {application.jobs?.companies?.website && (
                      <a
                        href={application.jobs.companies.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        Company Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;
