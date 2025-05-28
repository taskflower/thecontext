// src/themes/default/steps/UserLoginProcessStep.tsx
import { useEffect, useState } from "react";
import { useEngineStore, useCollections, useAppNavigation } from "@/core";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";

interface UserLoginProcessStepProps {
  attrs: {
    loginDataPath?: string; // ścieżka do danych logowania w kontekście
    currentUserPath?: string; // gdzie zapisać dane zalogowanego użytkownika
    successNavPath?: string; // gdzie przekierować po sukcesie
    errorNavPath?: string; // gdzie przekierować przy błędzie
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
  const successNavPath = attrs.successNavPath || "users/profile/view";
  const errorNavPath = attrs.errorNavPath || "users/login/form";

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
      
      // Przekieruj po krótkim opóźnieniu
      setTimeout(() => {
        go(`/:config/${successNavPath}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message);
      
      // Przekieruj z powrotem do formularza logowania po opóźnieniu
      setTimeout(() => {
        go(`/:config/${errorNavPath}`);
      }, 3000);
    } finally {
      setProcessing(false);
    }
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
          <p className="text-sm text-zinc-600">
            Przekierowujemy do Twojego profilu...
          </p>
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
          <p className="text-sm text-red-600 mb-4">
            {error}
          </p>
          <p className="text-xs text-zinc-500">
            Przekierowujemy z powrotem do formularza...
          </p>
        </div>
      </div>
    );
  }

  // Fallback - nie powinno się zdarzyć
  return <ErrorMessage error="Nieoczekiwany stan procesu logowania" />;
}