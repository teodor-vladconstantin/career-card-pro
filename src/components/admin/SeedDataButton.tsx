import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Database } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const seedCompanies = [
  {
    company_name: 'TechFlow Inc',
    description: 'Leading software development company specializing in cloud solutions and enterprise applications.',
    website: 'https://techflow.example.com',
    location: 'San Francisco, CA',
  },
  {
    company_name: 'DataVision Labs',
    description: 'AI and machine learning research company focused on computer vision and natural language processing.',
    website: 'https://datavision.example.com',
    location: 'Austin, TX',
  },
  {
    company_name: 'CloudScale Systems',
    description: 'Infrastructure and DevOps solutions provider for modern cloud architectures.',
    website: 'https://cloudscale.example.com',
    location: 'Remote',
  },
  {
    company_name: 'FinTech Solutions',
    description: 'Innovative financial technology company building next-gen payment systems.',
    website: 'https://fintech.example.com',
    location: 'New York, NY',
  },
  {
    company_name: 'HealthTech Innovations',
    description: 'Healthcare technology company revolutionizing patient care through digital solutions.',
    website: 'https://healthtech.example.com',
    location: 'Boston, MA',
  },
];

interface SeedDataButtonProps {
  onComplete: () => void;
}

export const SeedDataButton = ({ onComplete }: SeedDataButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setLoading(true);
    try {
      // First, create companies
      const companiesWithIds = seedCompanies.map(company => ({
        ...company,
        id: crypto.randomUUID(),
      }));

      const { error: companiesError } = await supabase
        .from('companies')
        .insert(companiesWithIds);

      if (companiesError) throw companiesError;

      // Create jobs for each company
      const jobs = companiesWithIds.flatMap((company, companyIndex) => [
        {
          company_id: company.id,
          title: `Senior ${['Full Stack', 'Frontend', 'Backend'][companyIndex % 3]} Developer`,
          description: `We are looking for an experienced developer to join our team. You will work on cutting-edge projects and collaborate with talented engineers.`,
          skills_required: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
          experience_required: 5 + (companyIndex % 3),
          location: company.location,
          job_type: ['remote', 'hybrid', 'onsite'][companyIndex % 3] as any,
          salary_range: `$${100 + companyIndex * 20}k - $${150 + companyIndex * 25}k`,
          is_active: true,
        },
        {
          company_id: company.id,
          title: `${['Junior', 'Mid-Level', 'Senior'][companyIndex % 3]} ${['UI/UX', 'DevOps', 'Data'][companyIndex % 3]} Engineer`,
          description: `Join our dynamic team and help build innovative solutions. Great opportunity for growth and learning.`,
          skills_required: ['JavaScript', 'Python', 'Docker', 'AWS'],
          experience_required: companyIndex % 5,
          location: company.location,
          job_type: ['onsite', 'remote', 'hybrid'][companyIndex % 3] as any,
          salary_range: `$${80 + companyIndex * 15}k - $${120 + companyIndex * 20}k`,
          is_active: true,
        },
      ]);

      const { error: jobsError } = await supabase
        .from('jobs')
        .insert(jobs);

      if (jobsError) throw jobsError;

      // Create user roles for companies
      const userRoles = companiesWithIds.map(company => ({
        user_id: company.id,
        role: 'company' as const,
      }));

      const { error: rolesError } = await supabase
        .from('user_roles')
        .insert(userRoles);

      if (rolesError) throw rolesError;

      toast({
        title: 'Success!',
        description: `Created ${seedCompanies.length} companies and ${jobs.length} jobs`,
      });

      onComplete();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to seed data',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="gradient-primary shadow-card">
          <Database className="mr-2 h-4 w-4" />
          Seed Demo Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Seed Demo Data?</AlertDialogTitle>
          <AlertDialogDescription>
            This will create {seedCompanies.length} demo companies with 2 jobs each for testing purposes.
            This action cannot be undone easily.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSeedData} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Demo Data'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
