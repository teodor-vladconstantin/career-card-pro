import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Briefcase, FileCheck, TrendingUp, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SeedDataButton } from '@/components/admin/SeedDataButton';
import { ClearDataButton } from '@/components/admin/ClearDataButton';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTalents: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
  });
  const [talents, setTalents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
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

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (roleData?.role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have admin privileges',
      });
      navigate('/');
      return;
    }

    await fetchAllData();
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch talents
      const { data: talentsData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          *,
          companies(company_name)
        `)
        .order('created_at', { ascending: false });

      // Fetch applications
      const { data: applicationsData } = await supabase
        .from('swipes')
        .select(`
          *,
          profiles(full_name),
          jobs(title)
        `)
        .eq('direction', 'right')
        .order('created_at', { ascending: false });

      setTalents(talentsData || []);
      setCompanies(companiesData || []);
      setJobs(jobsData || []);
      setApplications(applicationsData || []);

      setStats({
        totalTalents: talentsData?.length || 0,
        totalCompanies: companiesData?.length || 0,
        totalJobs: jobsData?.length || 0,
        totalApplications: applicationsData?.length || 0,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch data',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header isAuthenticated userRole="admin" />
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Header isAuthenticated userRole="admin" />
      
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                God Mode - Full system overview and control
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={fetchAllData}
                className="shadow-card"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <SeedDataButton onComplete={fetchAllData} />
              <ClearDataButton onComplete={fetchAllData} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Talents</CardDescription>
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTalents}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Companies</CardDescription>
                <Briefcase className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCompanies}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Active Jobs</CardDescription>
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalJobs}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Applications</CardDescription>
                <FileCheck className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="talents" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="talents">Talents</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="talents" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>All Talents</CardTitle>
                <CardDescription>View and manage talent profiles</CardDescription>
              </CardHeader>
              <CardContent>
                {talents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No talents yet</p>
                    <p className="text-sm">Talents will appear here once they sign up</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {talents.map((talent) => (
                    <div
                      key={talent.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{talent.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {talent.experience_years} years • {talent.location || 'No location'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {talent.skills.slice(0, 3).map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>All Companies</CardTitle>
                <CardDescription>View and manage company accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {companies.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No companies yet</p>
                    <p className="text-sm">Use "Seed Demo Data" to create test companies</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{company.company_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {company.location || 'No location'} • {company.website || 'No website'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>All Jobs</CardTitle>
                <CardDescription>View and manage all job postings</CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No jobs posted yet</p>
                    <p className="text-sm">Use "Seed Demo Data" to create test jobs</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {job.companies?.company_name} • {job.location} • {job.job_type}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={job.is_active ? 'default' : 'secondary'}>
                            {job.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>All Applications</CardTitle>
                <CardDescription>View and manage all job applications</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No applications yet</p>
                    <p className="text-sm">Applications will appear here once talents start swiping</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{app.profiles?.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Applied to: {app.jobs?.title}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge
                            variant={
                              app.application_status === 'accepted' ? 'default' :
                              app.application_status === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {app.application_status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
