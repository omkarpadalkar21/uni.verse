import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Shield,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/api';
import type { PlatformStatsDTO } from '@/types/admin';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStatsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load platform statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    delay = 0,
  }: {
    title: string;
    value: number;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="bg-card/50 backdrop-blur-lg border-white/10 hover:border-primary/30 transition-colors">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const QuickLinkCard = ({
    title,
    description,
    icon: Icon,
    to,
    color,
    delay = 0,
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    to: string;
    color: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link to={to}>
        <Card className="bg-card/50 backdrop-blur-lg border-white/10 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Platform overview and management</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="py-4">
                <p className="text-destructive text-center">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Platform Statistics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              subtitle={`${stats?.activeUsers || 0} active`}
              icon={Users}
              color="bg-blue-500/20 text-blue-500"
              delay={0.1}
            />
            <StatCard
              title="Total Clubs"
              value={stats?.totalClubs || 0}
              subtitle={`${stats?.activeClubs || 0} active, ${stats?.pendingClubs || 0} pending`}
              icon={Building2}
              color="bg-purple-500/20 text-purple-500"
              delay={0.15}
            />
            <StatCard
              title="Total Events"
              value={stats?.totalEvents || 0}
              subtitle={`${stats?.publishedEvents || 0} published`}
              icon={Calendar}
              color="bg-green-500/20 text-green-500"
              delay={0.2}
            />
            <StatCard
              title="Suspended Users"
              value={stats?.suspendedUsers || 0}
              icon={Users}
              color="bg-red-500/20 text-red-500"
              delay={0.25}
            />
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-medium">{stats?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Suspended</span>
                  <span className="font-medium text-red-500">{stats?.suspendedUsers || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending Verification</span>
                  <span className="font-medium text-yellow-500">{stats?.pendingVerificationUsers || 0}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="bg-card/50 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Club Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-medium text-green-500">{stats?.activeClubs || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending Approval</span>
                  <span className="font-medium text-yellow-500">{stats?.pendingClubs || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Suspended</span>
                  <span className="font-medium text-red-500">{stats?.suspendedClubs || 0}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/50 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Published</span>
                  <span className="font-medium text-green-500">{stats?.publishedEvents || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Draft</span>
                  <span className="font-medium text-yellow-500">{stats?.draftEvents || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">{stats?.completedEvents || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span className="font-medium text-red-500">{stats?.cancelledEvents || 0}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickLinkCard
              title="Manage Users"
              description="View and manage user accounts"
              icon={Users}
              to="/admin/users"
              color="bg-blue-500/20 text-blue-500"
              delay={0.45}
            />
            <QuickLinkCard
              title="Manage Clubs"
              description="Approve, reject, or suspend clubs"
              icon={Building2}
              to="/admin/clubs"
              color="bg-purple-500/20 text-purple-500"
              delay={0.5}
            />
            <QuickLinkCard
              title="Organizer Verification"
              description="Review pending verification requests"
              icon={FileCheck}
              to="/admin/organizer-verification"
              color="bg-green-500/20 text-green-500"
              delay={0.55}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
