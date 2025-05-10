// src/App.tsx
import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext"; 
import AppLoading from "./components/Loading";
import { MainRoutes } from "./components/DynamicRoutes";
import { ContextDebugger } from "./debug";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<AppLoading message="Ładowanie aplikacji..." />}>
          <MainRoutes />
          <ContextDebugger/>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;