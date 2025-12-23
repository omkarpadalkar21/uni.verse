import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi, type RegistrationRequest } from '@/lib/api';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegistrationRequest>({
    email: '',
    password: '',
    phone: '',
    universityId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Phone validation (Indian phone number format)
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+91)?[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format (use +91XXXXXXXXXX or 10-digit number)';
    }

    // University ID validation
    if (!formData.universityId) {
      newErrors.universityId = 'University ID is required';
    } else if (formData.universityId.length < 8 || formData.universityId.length > 25) {
      newErrors.universityId = 'University ID must be between 8 and 25 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register(formData);
      // Redirect to OTP verification page with email
      navigate('/auth/verify-email', { state: { email: formData.email, message: response.message } });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
        const errorData = error.response?.data;
        
        if (errorData?.errors) {
          // Handle validation errors
          const fieldErrors: Record<string, string> = {};
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            fieldErrors[field] = messages[0]; // Take first error message
          });
          setErrors(fieldErrors);
        } else {
          setError(errorData?.message || 'Registration failed. Please try again.');
        }
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />
      
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-white/10 p-4">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.svg" alt="UniVerse Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold font-sans">
              Uni<span className="text-primary">Verse</span>
            </span>
          </Link>
          <CardTitle className="text-xl">Create Your Account</CardTitle>
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
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@university.edu"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+919876543210 or 9876543210"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="universityId">University ID</Label>
              <Input
                id="universityId"
                name="universityId"
                type="text"
                placeholder="UNI12345678"
                value={formData.universityId}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.universityId ? 'border-destructive' : ''}
              />
              {errors.universityId && <p className="text-sm text-destructive">{errors.universityId}</p>}
            </div>

            <Button type="submit" className="w-full glow" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth/signin" className="text-primary hover:underline ml-1">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;
