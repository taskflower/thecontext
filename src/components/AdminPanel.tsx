// src/components/AdminPanel.tsx
import { seedFirestore } from '@/_firebase/seedFirestore';
import { useAuth } from '@/_npHooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSeedingData, setIsSeedingData] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeedData = async () => {
    if (!user) {
      setError('Musisz być zalogowany, aby dodać dane testowe');
      return;
    }

    setIsSeedingData(true);
    setError(null);
    
    try {
      const result = await seedFirestore(user.uid);
      setSeedResult(result);
      console.log('Dane testowe zostały dodane pomyślnie', result);
    } catch (err) {
      setError('Wystąpił błąd podczas dodawania danych testowych');
      console.error(err);
    } finally {
      setIsSeedingData(false);
    }
  };

  // Funkcja do nawigacji po dodaniu danych
  const handleNavigateToWorkspace = () => {
    if (seedResult) {
      if (seedResult.applicationId && seedResult.workspaceId) {
        // Nawiguj do ścieżki z aplikacją
        navigate(`/app/${seedResult.applicationId}/${seedResult.workspaceId}`);
      } else if (seedResult.workspaceId) {
        // Nawiguj bezpośrednio do workspace
        navigate(`/${seedResult.workspaceId}`);
      }
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-xl font-bold mb-4">Panel Administratora</h2>
      
      <button 
        onClick={handleSeedData}
        disabled={isSeedingData || !user}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isSeedingData ? 'Dodawanie danych...' : 'Dodaj dane testowe'}
      </button>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}
      
      {seedResult && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700">Dane testowe zostały dodane pomyślnie!</p>
          <p className="mt-2 text-sm">ID aplikacji: {seedResult.applicationId}</p>
          <p className="text-sm">ID workspace: {seedResult.workspaceId}</p>
          <p className="text-sm">ID scenariusza: {seedResult.scenarioId}</p>
          
          <button 
            onClick={handleNavigateToWorkspace}
            className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Przejdź do dodanego workspace
          </button>
        </div>
      )}
    </div>
  );
}