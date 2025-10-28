import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Eye, Edit, Trash } from 'lucide-react';
import { Job, Swipe } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CompanyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Swipe[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    skills_required: [] as string[],
    experience_required: 0,
    location: '',
    job_type: 'onsite' as 'remote' | 'onsite' | 'hybrid',
    salary_range: '',
  });
  const [newSkill, setNewSkill] = useState('');
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
    setUserId(session.user.id);
    await Promise.all([fetchJobs(session.user.id), fetchApplications(session.user.id)]);
    setLoading(false);
  };

  const fetchJobs = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch jobs',
      });
    }
  };

  const fetchApplications = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('swipes')
        .select(`
          *,
          jobs(*),
          profiles(*)
        `)
        .eq('direction', 'right')
        .in('job_id', 
          await supabase
            .from('jobs')
            .select('id')
            .eq('company_id', companyId)
            .then(res => res.data?.map(j => j.id) || [])
        )
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

  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.description) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    try {
      const { error } = await supabase.from('jobs').insert({
        company_id: userId,
        ...newJob,
      });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Job posted successfully',
      });

      setIsDialogOpen(false);
      resetForm();
      await fetchJobs(userId);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create job',
      });
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update(newJob)
        .eq('id', editingJob.id);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Job updated successfully',
      });

      setIsDialogOpen(false);
      setEditingJob(null);
      resetForm();
      await fetchJobs(userId);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update job',
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Job deleted successfully',
      });

      await fetchJobs(userId);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete job',
      });
    }
  };

  const handleUpdateApplicationStatus = async (swipeId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('swipes')
        .update({ application_status: status as any })
        .eq('id', swipeId);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Application status updated',
      });

      await fetchApplications(userId);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update status',
      });
    }
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setNewJob({
      title: job.title,
      description: job.description,
      skills_required: job.skills_required,
      experience_required: job.experience_required,
      location: job.location || '',
      job_type: job.job_type,
      salary_range: job.salary_range || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setNewJob({
      title: '',
      description: '',
      skills_required: [],
      experience_required: 0,
      location: '',
      job_type: 'onsite',
      salary_range: '',
    });
    setEditingJob(null);
  };

  const addSkill = () => {
    if (newSkill.trim() && !newJob.skills_required.includes(newSkill.trim())) {
      setNewJob({
        ...newJob,
        skills_required: [...newJob.skills_required, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setNewJob({
      ...newJob,
      skills_required: newJob.skills_required.filter(s => s !== skill),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header isAuthenticated userRole="company" />
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      <Header isAuthenticated userRole="company" />
      
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Company Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Manage your jobs and view applications
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingJob ? 'Edit Job' : 'Post New Job'}</DialogTitle>
                <DialogDescription>
                  {editingJob ? 'Update job details' : 'Create a new job posting'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="Senior Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={5}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type</Label>
                    <Select
                      value={newJob.job_type}
                      onValueChange={(value: any) => setNewJob({ ...newJob, job_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">Onsite</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_required">Years of Experience</Label>
                    <Input
                      id="experience_required"
                      type="number"
                      min="0"
                      value={newJob.experience_required}
                      onChange={(e) => setNewJob({ ...newJob, experience_required: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      placeholder="San Francisco, CA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary_range">Salary Range</Label>
                    <Input
                      id="salary_range"
                      value={newJob.salary_range}
                      onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                      placeholder="$100k - $150k"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Required Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newJob.skills_required.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/10"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={editingJob ? handleUpdateJob : handleCreateJob}
                    className="gradient-primary flex-1"
                  >
                    {editingJob ? 'Update Job' : 'Post Job'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="jobs">My Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            {jobs.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No jobs posted yet</p>
                  <Button className="gradient-primary" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Post Your First Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="shadow-card hover:shadow-elevated transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                          <CardDescription className="text-base">
                            {job.location} • {job.job_type} • {job.experience_required}+ years
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openEditDialog(job)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            {applications.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No applications yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <Card key={app.id} className="shadow-card hover:shadow-elevated transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{app.profiles?.full_name}</CardTitle>
                          <CardDescription>
                            Applied to: {app.jobs?.title}
                          </CardDescription>
                        </div>
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
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {app.profiles?.experience_years} years of experience • {app.profiles?.location}
                        </p>
                        
                        {app.profiles?.bio && (
                          <p className="text-sm line-clamp-2">{app.profiles.bio}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {app.profiles?.skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Select
                            value={app.application_status}
                            onValueChange={(value) => handleUpdateApplicationStatus(app.id, value)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_review">In Review</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyDashboard;
