import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="border rounded">
      <div className="container mx-auto min-h-[75vh] flex items-center justify-center px-6">
        <Card className="w-full max-w-md shadow-md hover:shadow-lg transition-shadow border-0">
          <CardHeader className="text-center space-y-2 pt-8">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              THE CONTEXT
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Welcome back
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pt-6">
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-center">Sign in to continue</h2>
              <p className="text-sm text-muted-foreground text-center">
                Access your knowledge context
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground px-2">with</span>
              <Separator className="flex-1" />
            </div>

            <Button 
              size="lg"
              className="w-full py-6 text-base"
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </Button>
          </CardContent>

          <CardFooter className="text-center px-8 pb-8">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{' '}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary transition-colors">
                Terms of Service
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;