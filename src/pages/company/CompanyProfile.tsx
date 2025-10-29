import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { Company } from '@/types/database';

const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [company, setCompany] = useState<Partial<Company>>({
    company_name: '',
    description: '',
    website: '',
    location: '',
    logo_url: '',
  });
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
    await fetchCompany(session.user.id);
    setLoading(false);
  };

  const fetchCompany = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCompany(data);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch company profile',
      });
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please upload an image file',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'File size must be less than 2MB',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      setCompany({ ...company, logo_url: publicUrl });

      toast({
        title: 'Success!',
        description: 'Logo uploaded successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to upload logo',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!company.company_name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Company name is required',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .upsert([{
          id: userId,
          company_name: company.company_name!,
          description: company.description,
          website: company.website,
          location: company.location,
          logo_url: company.logo_url,
        }]);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Company profile updated successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save company profile',
      });
    } finally {
      setSaving(false);
    }
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
      
      <div className="container py-8 max-w-4xl">
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="text-3xl">Company Profile</CardTitle>
            <CardDescription className="text-base">
              Manage your company information and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Logo</h3>
              
              <div className="flex items-center gap-6">
                {company.logo_url && (
                  <img
                    src={company.logo_url}
                    alt="Company logo"
                    className="h-20 w-20 rounded-lg object-cover border-2 border-border"
                  />
                )}
                <div className="flex-1">
                  <Input
                    id="logo_upload"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    className="hidden"
                  />
                  <Label htmlFor="logo_upload" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        {uploading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Upload Logo
                      </span>
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: Square image, max 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={company.company_name}
                  onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                  placeholder="Acme Inc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={company.description || ''}
                  onChange={(e) => setCompany({ ...company, description: e.target.value })}
                  placeholder="Tell candidates about your company..."
                  rows={5}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={company.website || ''}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                    placeholder="https://acme.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={company.location || ''}
                    onChange={(e) => setCompany({ ...company, location: e.target.value })}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              className="w-full gradient-primary"
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyProfile;
