// src/hooks/useAuth.tsx
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

// Rozszerzony interfejs użytkownika z tokenami
interface UserWithTokens extends User {
  availableTokens?: number;
  jwt?: string;
}

// Interfejs kontekstu autoryzacji
interface AuthContextType {
  user: UserWithTokens | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

// Utworzenie kontekstu
const AuthContext = createContext<AuthContextType | null>(null);

// Komponent dostawcy kontekstu
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<UserWithTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // Ustawienie nasłuchiwania na zmiany stanu uwierzytelnienia
  useEffect(() => {
    let unsubscribed = false;
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribed) return;
      
      if (currentUser) {
        try {
          // Pobierz token
          const token = await currentUser.getIdToken(true);
          setJwtToken(token);
          
          // Sprawdź, czy użytkownik istnieje w Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          let userData: UserWithTokens = { ...currentUser } as UserWithTokens;
          userData.jwt = token;

          if (!userDoc.exists()) {
            // Utwórz nowego użytkownika z początkowymi tokenami
            await setDoc(userDocRef, {
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              createdAt: new Date(),
              availableTokens: 5000
            });
            userData.availableTokens = 5000;
          } else {
            // Pobierz istniejące dane
            const data = userDoc.data();
            userData.availableTokens = data.availableTokens || 0;
          }

          setUser(userData);
          setError(null);
        } catch (error) {
          console.error('Authentication error:', error);
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

    // Funkcja czyszcząca
    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, []);

  // Odświeżenie tokenu
  useEffect(() => {
    if (!user) return;
    
    // Odświeżaj token co 45 minut (tokeny wygasają po 1 godzinie)
    const tokenRefreshInterval = setInterval(async () => {
      try {
        if (auth.currentUser) {
          const newToken = await auth.currentUser.getIdToken(true);
          setJwtToken(newToken);
          setUser(prev => prev ? { ...prev, jwt: newToken } : null);
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        setError(error instanceof Error ? error.message : String(error));
      }
    }, 45 * 60 * 1000);
    
    return () => clearInterval(tokenRefreshInterval);
  }, [user]);

  // Logowanie przez Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // Token dostępu Google API jeśli potrzebny
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential ? credential.accessToken : null;
      
      // Pobierz JWT
      const token = await result.user.getIdToken();
      setJwtToken(token);
      
      return {
        user: result.user,
        jwt: token,
        googleAccessToken: accessToken
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
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
      console.error('Logout error:', error);
      setError(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, []);

  // Pobranie tokenu
  const getToken = useCallback(async (): Promise<string | null> => {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(true);
        setJwtToken(token);
        return token;
      } catch (error) {
        console.error('Get token error:', error);
        setError(error instanceof Error ? error.message : String(error));
        return null;
      }
    }
    return jwtToken;
  }, [jwtToken]);

  // Wykonanie żądania z autoryzacją
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

  // Zwróć kontekst
  const authContext = {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
    getToken,
    fetchWithAuth
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};

// Hook do korzystania z kontekstu
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}