
// src/auth/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  getIdToken,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/provideDB/firebase/config';


// Extend Firebase User type with custom properties
export interface User extends FirebaseUser {
  availableTokens?: number;
  // Add any other custom user properties here
}

export interface AuthHook {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

// Token cache interface
interface TokenCache {
  token: string;
  expiry: number;
}

// Create a singleton token cache outside the hook
let tokenCache: TokenCache | null = null;

export function useAuth(): AuthHook {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Use the imported auth instance instead of getting it from getAuth()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Cast the Firebase user to our extended User type
      setUser(currentUser as User | null);
      if (!currentUser) {
        // Clear token cache when user logs out
        tokenCache = null;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Optimized getToken function with caching
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    
    const now = Date.now();
    
    // Return cached token if it's still valid (5 minutes before expiry)
    if (tokenCache && tokenCache.expiry > now + 300000) {
      return tokenCache.token;
    }
    
    try {
      const token = await getIdToken(user, true);
      
      // Cache the token with an expiry time (1 hour is typical for Firebase tokens)
      tokenCache = {
        token,
        expiry: now + 3600000
      };
      
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }, [user]);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      // Clear token cache on logout
      tokenCache = null;
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  }, []);

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
    getToken
  };
}

export default useAuth;