import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const SignIn: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

        <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-white/10 p-4">
            <CardHeader className="text-center">
                <Link to="/" className="flex items-center justify-center gap-2 mb-4">
                  <img src="/logo.svg" alt="UniVerse Logo" className="w-8 h-8" />
                  <span className="text-2xl font-bold font-sans">
                    Uni<span className="text-primary">Verse</span>
                  </span>
                </Link>
                <CardTitle className="text-xl">Welcome Back</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground text-sm">
                    This is a placeholder for the authentication flow.
                </p>
                <div className="grid gap-2">
                    <Button className="w-full" variant="outline">Sign in with Google</Button>
                    <Button className="w-full glow">Sign in with Email</Button>
                </div>
            </CardContent>
            <CardFooter className="justify-center text-sm text-muted-foreground">
                Don't have an account? <Link to="/auth/signup" className="text-primary hover:underline ml-1">Sign up</Link>
            </CardFooter>
        </Card>
    </div>
  );
};

export default SignIn;
