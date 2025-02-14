// src/hooks/useAuthState.ts
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { authService, AuthUser } from '@/services/authService';

interface AuthState {
  user: User | null;
  backendUser: AuthUser | null;
  loading: boolean;
}

export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const userData = await authService.checkAuthStatus();
        setBackendUser(userData);
      } else {
        setBackendUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, backendUser, loading };
}