// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, useConfig } from "./ConfigProvider";
import AppRouter from "./AppRouter";
import ConfigIndicator from "./components/ConfigIndicator";
import { ErrorBoundary, Loading } from "./components";
import { ContextDebugger } from "./debug";

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

const AppContent = () => {
  const { config, configId, configType, loading, error } = useConfig();

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

  const validConfigType: "local" | "firebase" | "documentdb" =
    configType === "firebase" || configType === "documentdb"
      ? (configType as "firebase" | "documentdb")
      : "local";

  return (
    <>
      <AppRouter />
      <ContextDebugger config={config} />
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
