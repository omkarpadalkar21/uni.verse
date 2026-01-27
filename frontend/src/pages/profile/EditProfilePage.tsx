import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Phone, School, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { userApi, getAccessToken } from '@/lib/api';
import type { UserProfileResponse, UpdateUserProfileRequest } from '@/types/user';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [formData, setFormData] = useState<UpdateUserProfileRequest>({
    phone: '',
    universityId: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = getAccessToken();
        if (!token) {
          navigate('/auth/signin');
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);
        const data = await userApi.getProfile(decoded.sub);
        setProfile(data);
        setFormData({
          phone: data.phone || '',
          universityId: data.universityId || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.phone && !/^(\+91)?[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (formData.universityId) {
      if (formData.universityId.length < 8 || formData.universityId.length > 25) {
        newErrors.universityId = 'University ID must be between 8 and 25 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      await userApi.updateProfile(formData);
      setSuccess(true);
      // Refresh profile data
      if (profile) {
        const token = getAccessToken();
        if (token) {
          const decoded = jwtDecode<JwtPayload>(token);
          const data = await userApi.getProfile(decoded.sub);
          setProfile(data);
        }
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to update profile');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-xl">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => navigate('/profile')}>Go to Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <Button variant="ghost" asChild>
            <Link to="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>

          {/* Edit Form */}
          <Card className="bg-card/50 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-500/10 border-green-500/20 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>Profile updated successfully!</AlertDescription>
                  </Alert>
                )}

                {/* Read-only email display */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email (cannot be changed)</Label>
                  <Input value={profile?.email || ''} disabled className="bg-muted/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+919876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSaving}
                      className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="universityId">University ID</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="universityId"
                      name="universityId"
                      type="text"
                      placeholder="UNI12345678"
                      value={formData.universityId}
                      onChange={handleChange}
                      disabled={isSaving}
                      className={`pl-10 font-mono ${errors.universityId ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.universityId && (
                    <p className="text-sm text-destructive">{errors.universityId}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 glow" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/profile')}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
