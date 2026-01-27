import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  School,
  Calendar,
  Shield,
  Users,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { userApi, getAccessToken } from '@/lib/api';
import type { UserProfileResponse } from '@/types/user';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  roles?: string[];
}

export default function UserProfilePage() {
  const { emailId } = useParams<{ emailId?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get current user's email from token if no emailId provided
        let email = emailId;
        if (!email) {
          const token = getAccessToken();
          if (token) {
            const decoded = jwtDecode<JwtPayload>(token);
            email = decoded.sub;
            setIsOwnProfile(true);
          } else {
            navigate('/auth/signin');
            return;
          }
        }

        if (email) {
          const data = await userApi.getProfile(email);
          setProfile(data);
          
          // Check if viewing own profile
          const token = getAccessToken();
          if (token) {
            const decoded = jwtDecode<JwtPayload>(token);
            setIsOwnProfile(decoded.sub === data.email);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [emailId, navigate]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'FACULTY':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'CLUB_LEADER':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'CLUB_MEMBER':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-destructive mb-4">{error || 'Profile not found'}</p>
              <Button onClick={() => navigate('/')}>Go Home</Button>
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
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            {isOwnProfile && (
              <Button variant="outline" asChild>
                <Link to="/profile/edit">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            )}
          </div>

          {/* Profile Card */}
          <Card className="bg-card/50 backdrop-blur-lg border-white/10">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 text-3xl">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {profile.email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-2xl">{profile.email.split('@')[0]}</CardTitle>
                  <p className="text-muted-foreground mt-1">{profile.email}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                    {profile.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className={getRoleBadgeColor(role)}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {role.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p>{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <p>{profile.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted">
                    <School className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">University ID</p>
                    <p className="font-mono">{profile.universityId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Member Since</p>
                    <p>{formatDate(profile.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Club Memberships */}
              {profile.clubMemberships && profile.clubMemberships.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4" />
                    Club Memberships
                  </h3>
                  <div className="space-y-3">
                    {profile.clubMemberships.map((membership) => (
                      <Link
                        key={membership.clubSlug}
                        to={`/clubs/${membership.clubSlug}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div>
                          <p className="font-medium">{membership.clubName}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {formatDate(membership.joinedAt)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {membership.role === 'LEADER' ? 'Leader' : 'Member'}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <Badge
                    variant="outline"
                    className={
                      profile.accountStatus === 'ACTIVE'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : profile.accountStatus === 'SUSPENDED'
                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }
                  >
                    {profile.accountStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
