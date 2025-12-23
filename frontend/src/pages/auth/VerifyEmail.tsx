import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi, setTokens, type VerifyEmailRequest } from '@/lib/api';
import { AlertCircle, CheckCircle } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const message = location.state?.message || 'Please check your email for the verification code.';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/auth/signup');
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 8);
    setOtp(value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 8) {
      setError('OTP must be 8 characters');
      return;
    }

    if (!/^[0-9A-Z]{8}$/.test(otp)) {
      setError('OTP must contain only numbers and uppercase letters');
      return;
    }

    setIsLoading(true);

    try {
      const verifyData: VerifyEmailRequest = { email, otp };
      const response = await authApi.verifyEmail(verifyData);
      setTokens(response.access_token, response.refresh_token);
      navigate('/'); // Redirect to home page
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Invalid or expired OTP. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    setResendSuccess(false);
    setError('');

    try {
      // Re-register to resend OTP (backend sends new verification email)
      await authApi.register({
        email,
        password: '', // Not needed for resend, backend will just send new OTP
        phone: '',
        universityId: '',
      });
      setResendSuccess(true);
      setCountdown(300); // Reset countdown
      setCanResend(false);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-600/10 blur-[120px] rounded-full" />

      <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-white/10 p-4">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.svg" alt="UniVerse Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold font-sans">
              Uni<span className="text-primary">Verse</span>
            </span>
          </Link>
          <CardTitle className="text-xl">Verify Your Email</CardTitle>
          <CardDescription className="text-muted-foreground">
            {message}
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-2">
            Sent to: <span className="font-medium text-foreground">{email}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resendSuccess && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>A new verification code has been sent to your email!</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="Enter 8-character code"
                value={otp}
                onChange={handleOtpChange}
                disabled={isLoading}
                className="font-mono text-lg tracking-wider text-center"
                maxLength={8}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the 8-character code sent to your email
              </p>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {countdown > 0 ? (
                <p>Code expires in: <span className="font-medium text-foreground">{formatTime(countdown)}</span></p>
              ) : (
                <p className="text-destructive">Code has expired. Please request a new one.</p>
              )}
            </div>

            <Button type="submit" className="w-full glow" disabled={isLoading || otp.length !== 8}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOtp}
                disabled={!canResend || resendLoading}
                className="w-full"
              >
                {resendLoading ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${formatTime(countdown)}`}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Wrong email?{' '}
          <Link to="/auth/signup" className="text-primary hover:underline ml-1">
            Go back
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
