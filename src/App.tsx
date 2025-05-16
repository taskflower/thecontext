// Zaktualizowany App.tsx (minimalna zmiana)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, useConfig } from "./ConfigProvider";
import AppRouter from "./AppRouter";
import EditorApp from "./editor/EditorApp"; // Import nowego komponentu
import { ConfigIndicator, ErrorBoundary, Loading } from "./components";
import { ContextDebugger } from "./debug";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Ścieżka edytora - poza ConfigProvider */}
          <Route path="/editor/:configId/*" element={<EditorApp />} />
          
          {/* Standardowa aplikacja wewnątrz ConfigProvider */}
          <Route path="/*" element={
            <ConfigProvider>
              <NormalApp />
            </ConfigProvider>
          } />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// Komponent dla normalnej aplikacji
const NormalApp = () => {
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