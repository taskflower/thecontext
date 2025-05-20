// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, useConfig } from "./ConfigProvider";
import AppRouter from "./AppRouter";
import EditorApp from "./editor/EditorApp"; // Import nowego komponentu
import { ErrorBoundary, Loading } from "./components";
import { ContextDebugger } from "./debug";
import { AuthProvider } from "./auth/AuthContext";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/editor/:configId/*" element={<EditorApp />} />
          <Route
            path="/*"
            element={
              <ConfigProvider>
                <NormalApp />
              </ConfigProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

const NormalApp = () => {
  const { config, loading, error } = useConfig();

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
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
      <ContextDebugger config={config} />
    </>
  );
};

export default App;
