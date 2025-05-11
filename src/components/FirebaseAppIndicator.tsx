// src/components/FirebaseAppIndicator.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Database } from 'lucide-react';

/**
 * Komponent wyświetlający wskaźnik, że aplikacja korzysta z konfiguracji Firebase
 * Zmodyfikowany, aby wykrywać aplikację Firebase niezależnie od ścieżki
 */
const FirebaseAppIndicator: React.FC = () => {
  const [appId, setAppId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Sprawdź, czy jesteśmy na ścieżce z Firebase
    const path = location.pathname;
    
    // Sprawdź zarówno format /app/{appId} jak i potencjalnie zapisany w localStorage
    const regexAppPath = /^\/app\/([^\/]+)/;
    const matchAppPath = path.match(regexAppPath);
    
    // Spróbuj pobrać z localStorage, jeśli używamy go do zapisywania ostatnio używanego appId
    const storedAppId = localStorage.getItem('lastFirebaseAppId');
    
    if (matchAppPath && matchAppPath[1]) {
      // Znaleziono w ścieżce URL
      const foundAppId = matchAppPath[1];
      setAppId(foundAppId);
      setIsVisible(true);
      
      // Zapisz do localStorage do późniejszego wykorzystania
      localStorage.setItem('lastFirebaseAppId', foundAppId);
    } else if (storedAppId) {
      // Używamy zapisanego appId, ale musimy sprawdzić, czy używamy go teraz
      // To wymaga informacji z kontekstu aplikacji, którą możemy dodać później
      // Na razie zakładamy, że jeśli jest zapisany, to jest używany
      setAppId(storedAppId);
      setIsVisible(true);
    } else {
      setAppId(null);
      setIsVisible(false);
    }
  }, [location]);

  if (!isVisible) return null;

  return (
    <div className="fixed left-4 bottom-4 z-50 px-3 py-2 text-xs rounded-md bg-blue-100 text-blue-800 font-semibold flex items-center shadow-md border border-blue-200">
      <Database className="w-3.5 h-3.5 mr-1.5" />
      <span>
        Firebase App: <span className="font-mono">{appId?.substring(0, 8)}...</span>
      </span>
    </div>
  );
};

export default FirebaseAppIndicator;