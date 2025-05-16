// src/themes/energygrant/common/ThemeUtils.tsx
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/core/utils';

/**
 * Hook do zarządzania trybem ciemnym
 */
export const useDarkMode = (initialMode = false) => {
  const [darkModeStorage, setDarkModeStorage] = useLocalStorage('darkMode', initialMode);
  const [darkMode, setDarkMode] = useState(darkModeStorage);

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

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return { darkMode, toggleDarkMode };
};

/**
 * Hook do pobierania informacji o roli użytkownika
 */
export const useUserRole = () => {
  const [userRole, setUserRole] = useState('beneficjent');

  // W rzeczywistej aplikacji pobieralibyśmy to z API lub local storage
  useEffect(() => {
    const fetchUserRole = async () => {
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

  const updateUserRole = (role) => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
  };

  return { userRole, updateUserRole };
};

/**
 * Funkcja pomocnicza do formatowania dat
 */
export const formatDate = (dateString) => {
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
export const formatPoints = (points) => {
  return new Intl.NumberFormat('pl-PL').format(points);
};