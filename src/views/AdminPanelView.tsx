// src/views/AdminPanelView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/_npHooks/useAuth';
import { seedFirestore } from '@/_firebase/seedFirestore';
import { useApplicationStore } from '@/hooks/useApplicationStore';
import { LoadingState } from '@/components/LoadingState';
import { getLayoutComponent } from '../tpl/templates';
import SubjectIcon from '@/components/SubjectIcon';

// Nowa funkcja do importu danych z JSON
async function importDataFromJson(userId: string, jsonData: any) {
  try {
    console.log('Importowanie danych z pliku JSON...');
    console.log('Struktura danych:', jsonData);
    
    // Tutaj można dodać logikę walidacji danych
    if (!jsonData || !Array.isArray(jsonData)) {
      throw new Error('Nieprawidłowy format danych. Oczekiwano tablicy aplikacji.');
    }
    
    // Wykorzystujemy istniejącą funkcję seedFirestore, ale z danymi z JSON
    // Implementacja tej funkcji wymaga modyfikacji seedFirestore.ts
    const result = await seedFirestoreFromData(userId, jsonData);
    return result;
  } catch (error) {
    console.error('Błąd podczas importu danych:', error);
    throw error;
  }
}

// Ta funkcja będzie musiała być zaimplementowana w seedFirestore.ts
async function seedFirestoreFromData(userId: string, appData: any[]) {
  console.log('Funkcja seedFirestoreFromData powinna zostać zaimplementowana w seedFirestore.ts');
  // Tymczasowo zwracamy puste ID
  return {
    applicationId: '',
    workspaceId: '',
    scenarioId: ''
  };
}

const AdminPanelView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { applications, fetchApplications, isLoading, error } = useApplicationStore();
  
  const [isSeedingData, setIsSeedingData] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  // Pobierz listę aplikacji przy ładowaniu strony
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Obsługa dodawania danych testowych
  const handleSeedData = async () => {
    if (!user) {
      setOperationError('Musisz być zalogowany, aby dodać dane testowe');
      return;
    }

    setIsSeedingData(true);
    setOperationError(null);
    setSeedResult(null);
    
    try {
      const result = await seedFirestore(user.uid);
      setSeedResult(result);
      console.log('Dane testowe zostały dodane pomyślnie', result);
    } catch (err) {
      setOperationError('Wystąpił błąd podczas dodawania danych testowych');
      console.error(err);
    } finally {
      setIsSeedingData(false);
    }
  };

  // Obsługa wyboru pliku JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJsonFile(file);
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonContent = JSON.parse(event.target?.result as string);
          setFileContent(jsonContent);
        } catch (err) {
          setOperationError('Nieprawidłowy format pliku JSON');
          console.error(err);
        }
      };
      
      reader.onerror = () => {
        setOperationError('Błąd podczas odczytu pliku');
      };
      
      reader.readAsText(file);
    }
  };

  // Obsługa importu danych z pliku JSON
  const handleImportData = async () => {
    if (!user) {
      setOperationError('Musisz być zalogowany, aby zaimportować dane');
      return;
    }

    if (!fileContent) {
      setOperationError('Najpierw musisz wybrać plik JSON');
      return;
    }

    setIsSeedingData(true);
    setOperationError(null);
    setSeedResult(null);
    
    try {
      const result = await importDataFromJson(user.uid, fileContent);
      setSeedResult(result);
      console.log('Dane zostały zaimportowane pomyślnie', result);
    } catch (err) {
      setOperationError('Wystąpił błąd podczas importu danych');
      console.error(err);
    } finally {
      setIsSeedingData(false);
    }
  };

  // Obsługa nawigacji po dodaniu danych
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

  // Użyj domyślnego layoutu
  const LayoutComponent = getLayoutComponent("default") || (() => <div>Layout Not Found</div>);

  return (
    <LoadingState
      isLoading={isLoading && !applications.length}
      error={error}
      loadingMessage="Ładowanie aplikacji..."
      errorTitle="Błąd ładowania aplikacji"
      onRetry={fetchApplications}
    >
      <LayoutComponent title="Panel administratora">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Panel administratora</h1>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
            >
              Wróć do aplikacji
            </button>
          </div>
          
          {/* Sekcja dodawania przykładowych danych */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Dodaj przykładowe dane</h2>
            <p className="mb-4 text-gray-600">
              Kliknij poniższy przycisk, aby załadować przykładowe dane z mocków do bazy Firestore.
            </p>
            
            <button 
              onClick={handleSeedData}
              disabled={isSeedingData || !user}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {isSeedingData ? 'Dodawanie danych...' : 'Dodaj przykładowe dane'}
            </button>
          </div>
          
          {/* Sekcja importu danych z JSON */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Import danych z pliku JSON</h2>
            <p className="mb-4 text-gray-600">
              Wybierz plik JSON zawierający strukturę aplikacji do zaimportowania.
            </p>
            
            <div className="mb-4">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            
            {jsonFile && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-700">
                  Wybrany plik: <span className="font-semibold">{jsonFile.name}</span>
                </p>
                {fileContent && (
                  <p className="text-sm text-green-700 mt-1">
                    Plik zawiera {Array.isArray(fileContent) ? fileContent.length : 'nieznana liczba'} aplikacji
                  </p>
                )}
              </div>
            )}
            
            <button 
              onClick={handleImportData}
              disabled={isSeedingData || !fileContent || !user}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {isSeedingData ? 'Importowanie danych...' : 'Importuj dane z pliku'}
            </button>
          </div>
          
          {/* Wynik operacji */}
          {operationError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{operationError}</p>
            </div>
          )}
          
          {seedResult && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-semibold mb-2">Dane zostały dodane pomyślnie!</p>
              <p className="text-sm text-green-600">ID aplikacji: {seedResult.applicationId}</p>
              <p className="text-sm text-green-600">ID workspace: {seedResult.workspaceId}</p>
              <p className="text-sm text-green-600">ID scenariusza: {seedResult.scenarioId}</p>
              
              <button 
                onClick={handleNavigateToWorkspace}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Przejdź do dodanego workspace
              </button>
            </div>
          )}
          
          {/* Lista aplikacji */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lista aplikacji</h2>
            
            {applications.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700">
                  Brak aplikacji w bazie danych. Dodaj przykładowe dane lub zaimportuj z pliku JSON.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div 
                    key={app.id} 
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors
                      ${selectedApplication === app.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setSelectedApplication(app.id === selectedApplication ? null : app.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <SubjectIcon iconName="briefcase" className="text-blue-500 mr-3" />
                        <div>
                          <h3 className="font-medium">{app.name}</h3>
                          <p className="text-sm text-gray-500">{app.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/${app.id}`);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Otwórz
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </LayoutComponent>
    </LoadingState>
  );
};

export default AdminPanelView;