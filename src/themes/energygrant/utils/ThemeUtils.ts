// src/themes/energygrant/layouts/common/AuthUtils.ts
import { useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  picture?: string;
  role?: string;
  points?: number;
}

export const useAuth = (initialUser: UserProfile | null = null) => {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [loading, setLoading] = useState(false);

  // Sprawdzenie, czy użytkownik jest zalogowany
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  // Symulacja logowania przez Google
  const loginWithGoogle = (navigateCallback?: () => void) => {
    setLoading(true);
    
    // Symulacja opóźnienia logowania
    setTimeout(() => {
      const mockUser = {
        name: "Jan Kowalski",
        email: "jan.kowalski@example.com",
        picture: "/api/placeholder/40/40",
        role: "beneficjent",
        points: 100
      };
      
      setUser(mockUser);
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      setLoading(false);
      
      // Przekierowanie po zalogowaniu
      if (navigateCallback) {
        navigateCallback();
      }
    }, 1500);
  };

  // Wylogowanie
  const logout = (navigateCallback?: () => void) => {
    setUser(null);
    localStorage.removeItem('authUser');
    
    if (navigateCallback) {
      navigateCallback();
    }
  };

  return { user, setUser, loading, setLoading, loginWithGoogle, logout };
};

// Hook do zarządzania trybem ciemnym
export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return { darkMode, toggleDarkMode };
};