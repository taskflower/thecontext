// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider 
} from '@firebase/auth';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { auth, googleProvider, db } from '@/firebase/config';

interface UserWithTokens extends User {
  availableTokens?: number;
  jwt?: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserWithTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Get the JWT token from the current user
        const token = await currentUser.getIdToken(true);
        setJwtToken(token);
        
        // Check if user document exists, if not create it
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        let userData: UserWithTokens = { ...currentUser };
        userData.jwt = token;

        if (!userDoc.exists()) {
          // Create user document with initial data and tokens
          await setDoc(userDocRef, {
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            createdAt: new Date(),
            availableTokens: 5000 // Add tokens field with initial value of 5000
          });
          userData.availableTokens = 5000;
        } else {
          // If user document exists, get tokens
          const data = userDoc.data();
          userData.availableTokens = data.availableTokens || 0;
        }

        setUser(userData);
      } else {
        setUser(null);
        setJwtToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set up a token refresh mechanism
  useEffect(() => {
    if (!user) return;
    
    // Token refresh logic - Firebase tokens expire after 1 hour
    const tokenRefreshInterval = setInterval(async () => {
      try {
        if (auth.currentUser) {
          const newToken = await auth.currentUser.getIdToken(true);
          setJwtToken(newToken);
          setUser(prev => prev ? { ...prev, jwt: newToken } : null);
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }, 55 * 60 * 1000); // Refresh 5 minutes before expiration (tokens last 1 hour)
    
    return () => clearInterval(tokenRefreshInterval);
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get additional access token for Google API access if needed
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential ? credential.accessToken : null;
      
      // Get the JWT token
      const token = await result.user.getIdToken();
      setJwtToken(token);
      
      return {
        user: result.user,
        jwt: token,
        googleAccessToken: accessToken
      };
    } catch (error) {
      console.error('Google Sign-In Error', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setJwtToken(null);
    } catch (error) {
      console.error('Logout Error', error);
      throw error;
    }
  };

  // Helper function to get the current JWT token
  const getToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      try {
        // Force token refresh if needed
        const token = await auth.currentUser.getIdToken(true);
        setJwtToken(token);
        return token;
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    }
    return jwtToken;
  };

  // Helper function to add JWT to fetch requests
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    
    const headers = {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
    };
    
    return fetch(url, {
      ...options,
      headers,
    });
  };

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    jwtToken,
    getToken,
    fetchWithAuth
  };
}