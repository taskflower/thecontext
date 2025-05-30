// src/themes/default/steps/UserRegisterProcessStep.tsx
import { useEffect, useState } from "react";
import { useEngineStore, useCollections, useAppNavigation } from "@/core";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";

interface Props {
  attrs: {
    registerDataPath?: string;
    currentUserPath?: string;
    successNavPath?: string; // teraz musi być "/:config/{{currentUser.role}}/dashboard/view"
    errorNavPath?: string;   // np. "/:config/main/register/form"
    title?: string;
    description?: string;
  };
}

export default function UserRegisterProcessStep({ attrs }: Props) {
  // **HOOKI NA GÓRZE**
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
        // **Proste przekierowanie** — useAppNavigation załatwi resztę
        go(attrs.successNavPath!);
      } catch (e: any) {
        setErr(e.message);
        setState("error");
        go(attrs.errorNavPath!);
      }
    })();
  }, [go, get, saveItem, set, attrs]);

  if (state === "idle" || saving) {
    return <LoadingSpinner text={attrs.title || "Creating Account..."} />;
  }
  if (state === "success") {
    return (
      <div className="text-center py-20">
        <h3 className="text-green-600 text-lg">
          Rejestracja zakończona sukcesem!
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Zaraz przeniesiemy Cię do Twojego dashboardu…
        </p>
      </div>
    );
  }
  return <ErrorMessage error={err} />;
}
