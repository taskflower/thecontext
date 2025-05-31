// src/themes/default/steps/UserLoginProcessStep.tsx
import { useEffect, useState } from "react";
import { useEngineStore, useAppNavigation } from "@/core";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";
import { useCollections } from "@/core/hooks/useCollections";

interface UserLoginProcessStepProps {
  attrs: {
    loginDataPath?: string; // ścieżka do danych logowania w kontekście
    currentUserPath?: string; // gdzie zapisać dane zalogowanego użytkownika
    successNavURL?: string; // gdzie przekierować po sukcesie
    errorNavURL?: string; // gdzie przekierować przy błędzie
    title?: string;
    description?: string;
  };
}

export default function UserLoginProcessStep({ attrs }: UserLoginProcessStepProps) {
  const { get, set } = useEngineStore();
  const { items: users, loading: loadingUsers } = useCollections("users");
  const { go } = useAppNavigation();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loginDataPath = attrs.loginDataPath || "loginData";
  const currentUserPath = attrs.currentUserPath || "currentUser";
  const successNavURL = attrs.successNavURL || "/{{currentUser.role}}/dashboard/view";
  const errorNavURL = attrs.errorNavURL || "/main/login/form";

  useEffect(() => {
    if (!loadingUsers && users.length > 0) {
      processLogin();
    }
  }, [loadingUsers, users]);

  const processLogin = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Pobierz dane logowania z kontekstu
      const loginData = get(loginDataPath);
      
      if (!loginData?.userId) {
        throw new Error("Nie wybrano użytkownika");
      }

      // Znajdź użytkownika w bazie
      const user = users.find((u: any) => u.id === loginData.userId);
      
      if (!user) {
        throw new Error("Użytkownik nie został znaleziony");
      }

      // Sprawdź czy użytkownik jest aktywny
      if (user.isActive === false) {
        throw new Error("Konto użytkownika jest nieaktywne");
      }

      // Zapisz dane zalogowanego użytkownika w kontekście
      const currentUserData = {
        ...user,
        loginTime: new Date().toISOString(),
        sessionId: Date.now().toString()
      };

      set(currentUserPath, currentUserData);
      
      // Wyczyść dane logowania
      set(loginDataPath, null);

      setSuccess(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSuccessNavigation = () => {
    console.log(`[UserLoginProcessStep] Navigating to: ${successNavURL}`);
    go(successNavURL);
  };

  const handleErrorNavigation = () => {
    console.log(`[UserLoginProcessStep] Navigating to error page: ${errorNavURL}`);
    go(errorNavURL);
  };

  if (loadingUsers) {
    return <LoadingSpinner text="Ładowanie danych użytkowników..." />;
  }

  if (processing) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-zinc-200/60 rounded-lg p-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            {attrs.title || "Logowanie..."}
          </h3>
          <p className="text-sm text-zinc-600">
            {attrs.description || "Sprawdzanie danych użytkownika"}
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-green-200 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            Logowanie pomyślne!
          </h3>
          <p className="text-sm text-zinc-600 mb-6">
            Zostałeś pomyślnie zalogowany do systemu.
          </p>
          
          <button
            onClick={handleSuccessNavigation}
            className="w-full bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-green-700 transition-colors"
          >
            Przejdź do dashboardu
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            Błąd logowania
          </h3>
          <p className="text-sm text-red-600 mb-2">
            {error}
          </p>
          <p className="text-xs text-zinc-500 mb-6">
            Sprawdź dane i spróbuj ponownie.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleErrorNavigation}
              className="flex-1 bg-zinc-600 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-zinc-700 transition-colors"
            >
              Spróbuj ponownie
            </button>
            <button
              onClick={() => go("/main")}
              className="flex-1 bg-zinc-100 text-zinc-700 text-sm font-medium px-4 py-2.5 rounded-md hover:bg-zinc-200 transition-colors"
            >
              Powrót do głównej
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - nie powinno się zdarzyć
  return <ErrorMessage error="Nieoczekiwany stan procesu logowania" />;
}