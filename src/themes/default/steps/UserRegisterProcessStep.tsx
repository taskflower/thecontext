// ------ src/themes/default/steps/UserRegisterProcessStep.tsx ------
import { useEffect, useState } from "react";
import { useEngineStore, useCollections, useAppNavigation } from "@/core";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";

interface UserRegisterProcessStepProps {
  attrs: {
    registerDataPath?: string;
    currentUserPath?: string;
    successNavPath?: string;
    errorNavPath?: string;
    title?: string;
    description?: string;
  };
}

export default function UserRegisterProcessStep({ attrs }: UserRegisterProcessStepProps) {
  const { get, set } = useEngineStore();
  const { items: users, saveItem } = useCollections("users");
  const { go } = useAppNavigation();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const registerDataPath = attrs.registerDataPath || "registerData";
  const currentUserPath = attrs.currentUserPath || "currentUser";
  const successNavPath = attrs.successNavPath || "main/dashboard/view";
  const errorNavPath = attrs.errorNavPath || "main/register/form";

  useEffect(() => {
    processRegistration();
  }, []);

  const processRegistration = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Pobierz dane rejestracji z kontekstu
      const registerData = get(registerDataPath);
      
      if (!registerData) {
        throw new Error("No registration data found");
      }

      // Sprawdź czy email już istnieje
      const existingUser = users.find((u: any) => u.email === registerData.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Utwórz nowego użytkownika
      const newUser = {
        id: Date.now().toString(),
        ...registerData,
        isActive: true,
        createdAt: new Date().toISOString(),
        loginTime: new Date().toISOString(),
        sessionId: Date.now().toString()
      };

      // Zapisz użytkownika do bazy
      await saveItem(newUser);

      // Zapisz jako zalogowanego użytkownika
      set(currentUserPath, newUser);
      
      // Wyczyść dane rejestracji
      set(registerDataPath, null);

      setSuccess(true);
      
      // Przekieruj po krótkim opóźnieniu
      setTimeout(() => {
        // Process the navPath template with current user data
        const processedNavPath = attrs.successNavPath?.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
          const segments = path.split('.');
          let value = newUser;
          for (const segment of segments) {
            value = value?.[segment];
          }
          return value || '';
        }) || successNavPath;
        
        go(`/:config/${processedNavPath}`);
      }, 2000);

    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message);
      
      // Przekieruj z powrotem do formularza po opóźnieniu
      setTimeout(() => {
        go(`/:config/${errorNavPath}`);
      }, 3000);
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-zinc-200/60 rounded-lg p-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            {attrs.title || "Creating Account..."}
          </h3>
          <p className="text-sm text-zinc-600">
            {attrs.description || "Setting up your account and workspace"}
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
            Account Created Successfully!
          </h3>
          <p className="text-sm text-zinc-600">
            Redirecting to your workspace...
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
            Registration Failed
          </h3>
          <p className="text-sm text-red-600 mb-4">
            {error}
          </p>
          <p className="text-xs text-zinc-500">
            Redirecting back to registration form...
          </p>
        </div>
      </div>
    );
  }

  return <ErrorMessage error="Unexpected registration state" />;
}
