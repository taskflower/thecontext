// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, useConfig } from './ConfigProvider';
import AppRouter from './AppRouter';
import ConfigIndicator from './components/ConfigIndicator';
import { ErrorBoundary, Loading } from './components';
import { ContextDebugger } from './debug';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ConfigProvider>
          <>
            <AppContent />
          </>
        </ConfigProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// Rozdzielamy renderowanie na osobny komponent, aby uniknąć problemów z kontekstem
const AppContent = () => {
  const { config, configId, configType, loading, error } = useConfig();

  if (loading) {
    return <Loading message="Ładowanie aplikacji..." />;
  }

  // Pokazujemy błąd, jeśli występuje
  if (error || !config) {
    return (
      <div className="p-4 text-red-600">
        <h1 className="text-xl font-bold">Błąd ładowania aplikacji</h1>
        <p>{error || "Nie można załadować konfiguracji aplikacji"}</p>
      </div>
    );
  }

  // Zapewniamy, że configType jest jednym z dozwolonych typów
  const validConfigType: "local" | "firebase" | "documentdb" = 
    (configType === 'firebase' || configType === 'documentdb') 
      ? configType as "firebase" | "documentdb"
      : 'local';

  return (
    <>
      <AppRouter />
      <ContextDebugger config={config}/>
      
      {/* Bezpośrednio renderujemy ConfigIndicator zamiast przez wrapper */}
      {configId && (
        <ConfigIndicator 
          configId={configId} 
          configType={validConfigType}
          config={config} 
        />
      )}
    </>
  );
};

export default App;
