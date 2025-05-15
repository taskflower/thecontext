// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, useConfig } from "./ConfigProvider";
import AppRouter from "./AppRouter";
import { ConfigIndicator, ErrorBoundary, Loading } from "./components";
import { ContextDebugger } from "./debug";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ConfigProvider>
          <AppContent />
        </ConfigProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

const AppContent = () => {
  const { config, configId, loading, error } = useConfig();

  if (loading) {
    return <Loading message="Ładowanie aplikacji..." />;
  }

  if (error || !config) {
    return (
      <div className="p-4 text-red-600">
        <h1 className="text-xl font-bold">Błąd ładowania aplikacji</h1>
        <p>{error || "Nie można załadować konfiguracji aplikacji"}</p>
      </div>
    );
  }

  return (
    <>
      <AppRouter />
      <ContextDebugger config={config} />
      {configId && <ConfigIndicator />}
    </>
  );
};

export default App;
