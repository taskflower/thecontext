// src/pages/auth/LoginPage.tsx
import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/'); // Redirect to homepage after login
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-96 flex items-center justify-center ">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-extrabold mb-2">Welcome Back</h1>
          <p className="text-gray-600">Log in to access your account</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button size="lg" onClick={handleGoogleLogin}>
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          By signing in, you agree to our <a href="/terms" className="text-blue-600 underline">Terms of Service</a>.
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
