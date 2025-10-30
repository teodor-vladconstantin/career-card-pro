import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ClearDataButtonProps {
  onComplete: () => void;
}

export const ClearDataButton = ({ onComplete }: ClearDataButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClearData = async () => {
    setLoading(true);
    try {
      // Delete in correct order to respect foreign key constraints
      await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('swipes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Get current user ID to avoid deleting admin
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('companies').delete().neq('id', session.user.id);
        await supabase.from('profiles').delete().neq('id', session.user.id);
      }

      toast({
        title: 'Success!',
        description: 'All demo data has been cleared',
      });

      onComplete();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to clear data',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="shadow-card">
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p className="font-semibold text-destructive">⚠️ This is a destructive action!</p>
            <p>This will permanently delete:</p>
            <ul className="list-disc list-inside ml-2">
              <li>All companies (except yours)</li>
              <li>All jobs</li>
              <li>All applications</li>
              <li>All notifications</li>
              <li>All talent profiles (except yours)</li>
            </ul>
            <p className="font-semibold">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleClearData} 
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Yes, Delete Everything'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
