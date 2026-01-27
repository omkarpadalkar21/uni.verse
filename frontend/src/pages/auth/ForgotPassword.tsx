import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi } from '@/lib/api';
import { AlertCircle, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setIsSuccess(true);
    } catch (err: unknown) {
      // For security, we show the same success message even if email doesn't exist
      // This prevents email enumeration attacks
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-white/10 p-4">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </motion.div>
              <CardTitle className="text-xl">Check Your Email</CardTitle>
              <CardDescription className="mt-2">
                If an account exists for <span className="font-medium text-foreground">{email}</span>,
                you'll receive a password reset code shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={() => navigate('/auth/reset-password', { state: { email } })}
              >
                Enter Reset Code
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
              >
                Try a different email
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-white/10 p-4">
          <CardHeader className="text-center">
            <Link to="/" className="flex items-center justify-center gap-2 mb-4">
              <img src="/logo.svg" alt="UniVerse Logo" className="w-8 h-8" />
              <span className="text-2xl font-bold font-sans">
                Uni<span className="text-primary">Verse</span>
              </span>
            </Link>
            <CardTitle className="text-xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a code to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full glow" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <Link
              to="/auth/signin"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
