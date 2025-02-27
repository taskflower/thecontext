// src/pages/auth/LoginPage.tsx
import React, { useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { driveConnected } = useGoogleDrive();

  useEffect(() => {
    if (driveConnected) {
      console.log('Google Drive connection status: Connected!');
    }
  }, [driveConnected]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-20rem)] flex items-center justify-center bg-muted/50 px-4 py-6 rounded-xl">
      <Card className="w-full max-w-md shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="text-center space-y-2 pt-6">
  <CardTitle className="text-2xl font-semibold tracking-tight">
    THE CONTEXT
  </CardTitle>
  <p className="text-sm text-gray-500">
    Your Personal Knowledge MULTITOOL Space
  </p>
</CardHeader>

<CardContent className="space-y-6 px-6 pt-4">
  <div className="space-y-2">
    <h2 className="text-lg font-medium text-center">Get Started</h2>
    <p className="text-sm text-gray-500 text-center">
      Sign in with your Google account to create and manage your knowledge context
    </p>
  </div>
  <div className="space-y-4">
    <p className="text-xs text-gray-500 text-center">
      You'll be asked to grant access to Google Drive for storing and managing your data. 
      We only operate within your personal Google account space, ensuring your privacy and data security.
    </p>
  </div>
  <div className="flex items-center space-x-2">
    <Separator className="flex-1" />
    <span className="text-xs text-gray-500 px-2">continue</span>
    <Separator className="flex-1" />
  </div>
  <Button 
    size="lg"
    className="w-full py-4"
    onClick={handleGoogleLogin}
  >
    Continue with Google
  </Button>
</CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;