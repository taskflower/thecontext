// ------ src/themes...
import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  tempEmail: string | null;
  authStep: 'email' | 'profile' | 'completed';
  login: (userData: User) => void;
  logout: () => void;
  setTempEmail: (email: string) => void;
  setAuthStep: (step: 'email' | 'profile' | 'completed') => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Provider component (dodaj do głównego App.tsx)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tempEmail, setTempEmail] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<'email' | 'profile' | 'completed'>('email');

  // Przywróć użytkownika z localStorage przy inicjalizacji
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setAuthStep('completed');
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setAuthStep('completed');
    setTempEmail(null);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setAuthStep('email');
    setTempEmail(null);
    localStorage.removeItem('currentUser');
  };

  const value: AuthContextType = {
    user,
    tempEmail,
    authStep,
    login,
    logout,
    setTempEmail,
    setAuthStep,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useMockAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};