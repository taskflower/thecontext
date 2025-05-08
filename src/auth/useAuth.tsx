// src/hooks/useAuth.tsx
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { 
  signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider 
} from '@firebase/auth';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { auth, db, googleProvider } from '@/provideDB/firebase/config';

// Uproszczony typ użytkownika z tokenami
interface UserWithTokens extends User {
  availableTokens?: number;
  jwt?: string;
}

// Interfejs kontekstu auth
interface AuthContextType {
  user: UserWithTokens | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<UserWithTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // Nasłuchiwanie zmian stanu autoryzacji
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(true);
          setJwtToken(token);
          
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          let userData: UserWithTokens = { ...currentUser } as UserWithTokens;
          userData.jwt = token;

          if (!userDoc.exists()) {
            // Nowy użytkownik
            await setDoc(userDocRef, {
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              createdAt: new Date(),
              availableTokens: 5000
            });
            userData.availableTokens = 5000;
          } else {
            // Istniejący użytkownik
            userData.availableTokens = userDoc.data().availableTokens || 0;
          }

          setUser(userData);
          setError(null);
        } catch (error) {
          setError(error instanceof Error ? error.message : String(error));
          setUser(null);
          setJwtToken(null);
        }
      } else {
        setUser(null);
        setJwtToken(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Odświeżanie tokena
  useEffect(() => {
    if (!user) return;
    
    const tokenRefreshInterval = setInterval(async () => {
      try {
        if (auth.currentUser) {
          const newToken = await auth.currentUser.getIdToken(true);
          setJwtToken(newToken);
          setUser(prev => prev ? { ...prev, jwt: newToken } : null);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : String(error));
      }
    }, 45 * 60 * 1000); // 45 minut
    
    return () => clearInterval(tokenRefreshInterval);
  }, [user]);

  // Logowanie Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = await result.user.getIdToken();
      setJwtToken(token);
      
      return { user: result.user, jwt: token, googleAccessToken: credential?.accessToken };
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Wylogowanie
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setJwtToken(null);
      setUser(null);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, []);

  // Pobranie tokena
  const getToken = useCallback(async (): Promise<string | null> => {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(true);
        setJwtToken(token);
        return token;
      } catch (error) {
        setError(error instanceof Error ? error.message : String(error));
        return null;
      }
    }
    return jwtToken;
  }, [jwtToken]);

  // Wykonanie żądania z autoryzacją
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }, [getToken]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signInWithGoogle,
      logout,
      getToken,
      fetchWithAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}