// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { AuthUser, authService } from '@/services/authService';

// Centralized interface for auth-related data and functionality
interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  getToken: async () => null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Firestore user data (with better error handling)
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        availableTokens: userData?.availableTokens || 0,
        createdAt: userData?.createdAt?.toDate() || new Date(firebaseUser.metadata.creationTime || Date.now()),
        lastLoginAt: userData?.lastLoginAt?.toDate() || new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
        name: userData?.name || '',
        role: userData?.role || 'user'
      };
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
      // Return basic user data if Firestore fails
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        availableTokens: 0,
        createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
        lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now())
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      try {
        if (firebaseUser) {
          const userData = await fetchUserData(firebaseUser);
          setCurrentUser(userData);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setIsLoading(true);
      const user = await authService.signInWithGoogle();
      setCurrentUser(user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified token retrieval method
  const getToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    
    try {
      return await auth.currentUser.getIdToken(true);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const value = {
    currentUser,
    isLoading,
    signIn,
    signOut,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};