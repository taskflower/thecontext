import { useState, useEffect } from 'react';

/**
 * Hook do zarządzania lokalnym magazynem danych
 */
export const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
  // Funkcja do pobierania wartości z localStorage
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Błąd podczas odczytu z localStorage dla klucza "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Funkcja do zapisywania wartości w localStorage
  const setValue = (value: T | ((val: T) => T)): void => {
    if (typeof window === 'undefined') {
      console.warn('Nie można użyć localStorage poza środowiskiem przeglądarki');
      return;
    }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Błąd podczas zapisu do localStorage dla klucza "${key}":`, error);
    }
  };

  // Nasłuchiwanie na zmiany w innych oknach/kartach
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent): void => {
      if (e.key === key) {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
};

/**
 * Hook do zarządzania trybem ciemnym
 */
export const useDarkMode = (initialMode = false): { darkMode: boolean; toggleDarkMode: () => void } => {
  const [darkModeStorage, setDarkModeStorage] = useLocalStorage<boolean | null>('darkMode', initialMode);
  const [darkMode, setDarkMode] = useState<boolean>(darkModeStorage !== null ? darkModeStorage : initialMode);

  // Synchronizacja stanu z localStorage
  useEffect(() => {
    setDarkModeStorage(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, setDarkModeStorage]);

  // Sprawdzenie preferencji systemowych przy pierwszym ładowaniu
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode && darkModeStorage === null) {
      setDarkMode(true);
    }
  }, [darkModeStorage]);

  const toggleDarkMode = (): void => setDarkMode(!darkMode);

  return { darkMode, toggleDarkMode };
};

/**
 * Hook do pobierania informacji o roli użytkownika
 */
export const useUserRole = (): { userRole: string; updateUserRole: (role: string) => void } => {
  const [userRole, setUserRole] = useState<string>('beneficjent');

  // W rzeczywistej aplikacji pobieralibyśmy to z API lub local storage
  useEffect(() => {
    const fetchUserRole = async (): Promise<void> => {
      try {
        // Symulacja pobierania danych z API
        await new Promise(resolve => setTimeout(resolve, 100));
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
          setUserRole(storedRole);
        }
      } catch (error) {
        console.error('Błąd pobierania roli użytkownika:', error);
      }
    };

    fetchUserRole();
  }, []);

  const updateUserRole = (role: string): void => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
  };

  return { userRole, updateUserRole };
};

/**
 * Funkcja pomocnicza do formatowania dat
 */
export const formatDate = (dateString: string | number | Date): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Funkcja pomocnicza do formatowania punktów
 */
export const formatPoints = (points: number): string => {
  return new Intl.NumberFormat('pl-PL').format(points);
};