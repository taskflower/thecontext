// src/App.tsx
import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext"; 
import AppLoading from "./components/Loading";
import { MainRoutes } from "./components/DynamicRoutes";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<AppLoading message="Ładowanie aplikacji..." />}>
          <MainRoutes />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;