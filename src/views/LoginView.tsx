// src/views/LoginView.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const LoginView: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      // TODO: Add error handling for user
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};