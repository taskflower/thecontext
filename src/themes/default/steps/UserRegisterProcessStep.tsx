// src/themes/default/steps/UserRegisterProcessStep.tsx - FIXED
import { useEffect, useState } from "react";
import { useEngineStore, useCollections, useAppNavigation } from "@/core";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";

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
        
        // ✅ POPRAWIONE: używaj prostego formatu
        const targetPath = attrs.successNavURL || "/{{currentUser.role}}/dashboard/view";
        
        console.log(`[UserRegisterProcessStep] Using navigation template: ${targetPath}`);
        
        setTimeout(() => {
          go(targetPath);
        }, 1500);
        
      } catch (e: any) {
        setErr(e.message);
        setState("error");
        
        // ✅ POPRAWIONE: używaj prostego formatu
        const errorPath = attrs.errorNavURL || "/main/register/form";
        setTimeout(() => {
          go(errorPath);
        }, 3000);
      }
    })();
  }, [go, get, saveItem, set, attrs]);

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
          <p className="text-sm text-zinc-600">
            {attrs.description || "Zaraz przeniesiemy Cię do Twojego dashboardu…"}
          </p>
        </div>
      </div>
    );
  }
  
  return <ErrorMessage error={err} />;
}