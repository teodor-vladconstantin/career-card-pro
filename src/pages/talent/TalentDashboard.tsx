import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Layout/Header';
import { SwipeContainer } from '@/components/SwipeCard/SwipeContainer';
import { Job } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TalentDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    jobType: 'all',
    experienceRequired: 'all',
    location: '',
    skills: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchJobs();
    }
  }, [userId, filters]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setUserId(session.user.id);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.jobType !== 'all') {
        query = query.eq('job_type', filters.jobType as any);
      }
      
      if (filters.experienceRequired !== 'all') {
        query = query.lte('experience_required', parseInt(filters.experienceRequired));
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter already swiped jobs
      const { data: swipedJobs } = await supabase
        .from('swipes')
        .select('job_id')
        .eq('talent_id', userId);

      const swipedJobIds = new Set(swipedJobs?.map(s => s.job_id) || []);
      let filteredJobs = data?.filter(job => !swipedJobIds.has(job.id)) || [];

      // Filter by skills if provided
      if (filters.skills) {
        const searchSkills = filters.skills.toLowerCase().split(',').map(s => s.trim());
        filteredJobs = filteredJobs.filter(job =>
          job.skills_required.some(skill =>
            searchSkills.some(searchSkill =>
              skill.toLowerCase().includes(searchSkill)
            )
          )
        );
      }

      setJobs(filteredJobs);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch jobs',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (jobId: string, direction: 'left' | 'right') => {
    try {
      const { error } = await supabase.from('swipes').insert({
        talent_id: userId,
        job_id: jobId,
        direction,
      });

      if (error) throw error;

      if (direction === 'right') {
        // Create notification for company
        const job = jobs.find(j => j.id === jobId);
        if (job) {
          await supabase.from('notifications').insert({
            user_id: job.company_id,
            type: 'application_received',
            title: 'New Application',
            message: `A candidate has applied to ${job.title}`,
            related_job_id: jobId,
            related_talent_id: userId,
          });

          toast({
            title: 'Applied!',
            description: 'Your application has been submitted successfully.',
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save swipe',
      });
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
      
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Discover Your Next Opportunity</h1>
          <p className="text-muted-foreground text-lg">
            Swipe right to apply, left to pass
          </p>
        </div>

        {/* Filters Toggle */}
        <div className="flex justify-center mb-6">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="max-w-4xl mx-auto mb-8 shadow-card">
            <CardHeader>
              <CardTitle>Filter Jobs</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select value={filters.jobType} onValueChange={(value) => setFilters({ ...filters, jobType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Experience Required</Label>
                <Select value={filters.experienceRequired} onValueChange={(value) => setFilters({ ...filters, experienceRequired: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Level</SelectItem>
                    <SelectItem value="0">Entry Level (0 years)</SelectItem>
                    <SelectItem value="2">Junior (0-2 years)</SelectItem>
                    <SelectItem value="5">Mid-Level (3-5 years)</SelectItem>
                    <SelectItem value="10">Senior (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Skills (comma-separated)</Label>
                <Input
                  placeholder="React, TypeScript, Node.js..."
                  value={filters.skills}
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Button onClick={fetchJobs} className="w-full gradient-primary">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters Display */}
        {(filters.jobType !== 'all' || filters.experienceRequired !== 'all' || filters.location || filters.skills) && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {filters.jobType !== 'all' && (
              <Badge variant="secondary" className="text-sm">
                {filters.jobType}
              </Badge>
            )}
            {filters.experienceRequired !== 'all' && (
              <Badge variant="secondary" className="text-sm">
                Max {filters.experienceRequired} years exp
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="text-sm">
                📍 {filters.location}
              </Badge>
            )}
            {filters.skills && (
              <Badge variant="secondary" className="text-sm">
                Skills: {filters.skills}
              </Badge>
            )}
          </div>
        )}

        {/* Swipe Container */}
        <div className="flex justify-center">
          <SwipeContainer
            jobs={jobs}
            onSwipe={handleSwipe}
            onLoadMore={fetchJobs}
          />
        </div>
      </div>
    </div>
  );
};

export default TalentDashboard;
