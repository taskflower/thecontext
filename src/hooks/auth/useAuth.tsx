// src/hooks/useAuth.ts
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider 
} from '@firebase/auth';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { auth, googleProvider, db } from '@/_firebase/config';
import { errorUtils } from '@/utils/errorUtils';

// Extended user interface with tokens
interface UserWithTokens extends User {
  availableTokens?: number;
  jwt?: string;
}

// Create context to avoid prop drilling and ensure auth state persists
interface AuthContextType {
  user: UserWithTokens | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Provider component for wrapping the app
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Hook for components to use
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Implementation with memoized functions to prevent unnecessary re-renders
function useProvideAuth(): AuthContextType {
  const [user, setUser] = useState<UserWithTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // Set up listener for auth state changes
  useEffect(() => {
    // Store the unsubscribe function
    let unsubscribed = false;
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribed) return; // Prevent state updates after unmount
      
      if (currentUser) {
        try {
          // Get token
          const token = await currentUser.getIdToken(true);
          setJwtToken(token);
          
          // Check if user exists in Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          let userData: UserWithTokens = { ...currentUser };
          userData.jwt = token;

          if (!userDoc.exists()) {
            // Create new user with initial tokens
            await setDoc(userDocRef, {
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              createdAt: new Date(),
              availableTokens: 5000
            });
            userData.availableTokens = 5000;
          } else {
            // Get existing user data
            const data = userDoc.data();
            userData.availableTokens = data.availableTokens || 0;
          }

          setUser(userData);
        } catch (error) {
          const errorMsg = errorUtils.handleError(error, "useAuth:onAuthStateChanged");
          console.error(errorMsg);
          setUser(null);
          setJwtToken(null);
        }
      } else {
        setUser(null);
        setJwtToken(null);
      }
      
      setLoading(false);
    });

    // Clean up function
    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, []);

  // Set up token refresh
  useEffect(() => {
    if (!user) return;
    
    // Refresh token every 45 minutes (tokens expire after 1 hour)
    const tokenRefreshInterval = setInterval(async () => {
      try {
        if (auth.currentUser) {
          const newToken = await auth.currentUser.getIdToken(true);
          setJwtToken(newToken);
          setUser(prev => prev ? { ...prev, jwt: newToken } : null);
        }
      } catch (error) {
        errorUtils.handleError(error, "useAuth:tokenRefresh");
      }
    }, 45 * 60 * 1000);
    
    return () => clearInterval(tokenRefreshInterval);
  }, [user]);

  // Memoize functions to prevent unnecessary re-renders
  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Google API access token if needed
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential ? credential.accessToken : null;
      
      // Get JWT
      const token = await result.user.getIdToken();
      setJwtToken(token);
      
      return {
        user: result.user,
        jwt: token,
        googleAccessToken: accessToken
      };
    } catch (error) {
      errorUtils.handleError(error, "useAuth:signInWithGoogle");
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setJwtToken(null);
      setUser(null);
    } catch (error) {
      errorUtils.handleError(error, "useAuth:logout");
      throw error;
    }
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(true);
        setJwtToken(token);
        return token;
      } catch (error) {
        errorUtils.handleError(error, "useAuth:getToken");
        return null;
      }
    }
    return jwtToken;
  }, [jwtToken]);

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    
    const headers = {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
    };
    
    return fetch(url, {
      ...options,
      headers,
    });
  }, [getToken]);

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    getToken,
    fetchWithAuth
  };
}