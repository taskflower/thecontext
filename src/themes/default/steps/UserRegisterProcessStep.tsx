// src/themes/default/steps/UserRegisterProcessStep.tsx - IMPROVED VERSION
import { useEffect, useState } from "react";
import { useEngineStore, useAppNavigation } from "@/core";
import { LoadingSpinner } from "../commons/StepWrapper";
import { useCollections } from "@/core/hooks/useCollections";

interface Props {
  attrs: {
    registerDataPath?: string;
    currentUserPath?: string;
    successNavURL?: string; // może zawierać {{currentUser.role}}
    errorNavURL?: string;
    title?: string;
    description?: string;
  };
}

export default function UserRegisterProcessStep({ attrs }: Props) {
  const { get, set } = useEngineStore();
  const { saveItem, loading: saving } = useCollections("users");
  const { go } = useAppNavigation();
  const [state, setState] = useState<"idle"|"success"|"error">("idle");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const data = get(attrs.registerDataPath || "registerData");
        if (!data) throw new Error("Brak danych rejestracyjnych");

        const newUser = { id: Date.now().toString(), ...data, isActive: true };
        await saveItem(newUser);
        set(attrs.currentUserPath || "currentUser", newUser);

        setState("success");
        
      } catch (e: any) {
        setErr(e.message);
        setState("error");
      }
    })();
  }, [get, saveItem, set, attrs]);

  const handleSuccessNavigation = () => {
    const targetPath = attrs.successNavURL || "/{{currentUser.role}}/dashboard/view";
    console.log(`[UserRegisterProcessStep] Navigating to: ${targetPath}`);
    go(targetPath);
  };

  const handleErrorNavigation = () => {
    const errorPath = attrs.errorNavURL || "/main/register/form";
    console.log(`[UserRegisterProcessStep] Navigating to error page: ${errorPath}`);
    go(errorPath);
  };

  if (state === "idle" || saving) {
    return <LoadingSpinner text={attrs.title || "Creating Account..."} />;
  }
  
  if (state === "success") {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-green-200 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            Rejestracja zakończona sukcesem!
          </h3>
          <p className="text-sm text-zinc-600 mb-6">
            {attrs.description || "Twoje konto zostało utworzone pomyślnie."}
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
  
  if (state === "error") {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            Wystąpił błąd podczas rejestracji
          </h3>
          <p className="text-sm text-zinc-600 mb-2">
            {err}
          </p>
          <p className="text-xs text-zinc-500 mb-6">
            Spróbuj ponownie lub skontaktuj się z administratorem.
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
  
  return null;
}