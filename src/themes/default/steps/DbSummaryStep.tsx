// src/themes/default/steps/DbSummaryStep.tsx - GENERYCZNA WERSJA
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useWorkspaceSchema,
  useEngineStore,
  useAppNavigation,
} from "@/core";
import { FieldWidget } from "../widgets/form/FieldWidget";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";
import { useCollections } from "@/core/hooks/useCollections";

interface DbSummaryStepProps {
  attrs: {
    schemaPath: string;
    title?: string;
    description?: string;

    // ✅ UJEDNOLICONA STRUKTURA NAWIGACJI
    onSubmit?: {
      collection?: string; // Kolekcja do zapisu
      navURL?: string; // Ścieżka po zapisie
      clearContext?: boolean; // Czy wyczyścić kontekst po zapisie
    };

    onCancel?: {
      navURL: string; // Ścieżka anulowania
    };

    // Konfiguracja danych
    loadFromContext?: string; // Klucz kontekstu do załadowania

    // Opcje wyświetlania
    allowEdit?: boolean; // Czy można edytować pola
    showGeneratedBadge?: boolean; // Czy pokazać badge "AI Generated"
    readOnly?: boolean; // Tryb tylko do odczytu

    // Dodatkowe akcje
    additionalActions?: Array<{
      type: "regenerate" | "custom" | "edit";
      label: string;
      navURL?: string; // Pełna ścieżka nawigacji
      nextStep?: string; // Slug kolejnego kroku w flow
      variant?: "primary" | "secondary" | "outline" | "danger";
      clearContext?: boolean; // Czy wyczyścić kontekst przed nawigacją
    }>;

    // Fallback akcje gdy brak danych w kontekście
    noDataActions?: Array<{
      label: string;
      navURL?: string;
      nextStep?: string;
      variant?: "primary" | "secondary" | "outline";
    }>;
  };
}

export default function DbSummaryStep({ attrs }: DbSummaryStepProps) {
  const { workspace = "", id } = useParams();
  const { go } = useAppNavigation();

  const { schema, loading, error } = useWorkspaceSchema(
    attrs?.schemaPath || ""
  );
  const { saveItem, loading: savingToDb } = useCollections(
    attrs?.onSubmit?.collection || ""
  );
  const { get, set } = useEngineStore();
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // ✅ UŻYWAMY UJEDNOLICONEJ KONFIGURACJI
  const contextKey = attrs?.loadFromContext || attrs.schemaPath;
  const hasContextData = !!get(contextKey);

  // Load context data when component mounts
  useEffect(() => {
    const contextData = get(contextKey);
    if (contextData) setData(contextData);
  }, [contextKey, get]);

  const handleSaveToDatabase = async () => {
    setSaving(true);
    try {
      // Zapisz do bazy jeśli skonfigurowane
      if (attrs?.onSubmit?.collection) {
        await saveItem({ ...data, id: data.id || id || Date.now().toString() });
      }

      // Wyczyść kontekst jeśli skonfigurowane
      if (attrs?.onSubmit?.clearContext !== false) {
        set(contextKey, null);
      }

      // Nawiguj do następnej strony
      const navURL = attrs?.onSubmit?.navURL || `${workspace}/list/view`;
      go(navURL);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const cancelPath = attrs?.onCancel?.navURL || `${workspace}/list/view`;
    go(cancelPath);
  };

  const handleAdditionalAction = (action: any) => {
    // Wyczyść kontekst jeśli skonfigurowane
    if (action.clearContext) {
      set(contextKey, null);
    }

    // Określ ścieżkę nawigacji
    let navPath;
    if (action.nextStep) {
      // nextStep = kolejny krok w obecnym flow
      const currentFlow = window.location.pathname.split("/")[3]; // Zakładając /:config/workspace/flow/step
      navPath = `${workspace}/${currentFlow}/${action.nextStep}`;
    } else if (action.navURL) {
      // navURL = pełna ścieżka
      navPath = action.navURL;
    } else {
      navPath = `${workspace}/list/view`;
    }

    go(navPath);
  };

  const handleNoDataAction = (action: any) => {
    let navPath;
    if (action.nextStep) {
      const currentFlow = window.location.pathname.split("/")[3];
      navPath = `${workspace}/${currentFlow}/${action.nextStep}`;
    } else if (action.navURL) {
      navPath = action.navURL;
    } else {
      navPath = `${workspace}/list/view`;
    }

    go(navPath);
  };

  if (loading) return <LoadingSpinner text="Loading summary..." />;
  if (error || !schema)
    return (
      <ErrorMessage error={error || `Schema not found: ${attrs?.schemaPath}`} />
    );

  // ✅ GENERYCZNY FALLBACK SCREEN ZAMIAST HARDKODOWANYCH AKCJI
  if (!hasContextData) {
    return (
      <div className="py-24 text-center">
        <div className="text-yellow-600 text-sm font-medium mb-2">
          No Data Found
        </div>
        <div className="text-xs text-zinc-500 mb-6">
          No data found in context: {contextKey}
        </div>

        {attrs?.noDataActions && attrs.noDataActions.length > 0 ? (
          <div className="space-x-3">
            {attrs.noDataActions.map((action, i) => {
              const variants = {
                primary: "bg-blue-600 text-white hover:bg-blue-700",
                secondary: "bg-zinc-600 text-white hover:bg-zinc-700",
                outline:
                  "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50",
              };

              return (
                <button
                  key={i}
                  onClick={() => handleNoDataAction(action)}
                  className={`px-4 py-2 rounded transition-colors ${
                    variants[action.variant || "outline"]
                  }`}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        ) : (
          <button
            onClick={handleCancel}
            className="bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-700"
          >
            ← Go Back
          </button>
        )}
      </div>
    );
  }

  const isReadOnly = attrs?.readOnly || !attrs?.allowEdit;

  return (
    <div className="max-w-4xl mx-auto">
      {(attrs.title || attrs.description) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-zinc-900">
            {attrs.title || "📋 Review & Save"}
          </h2>
          {attrs.description && (
            <p className="text-zinc-600 mt-1 text-sm">{attrs.description}</p>
          )}
        </div>
      )}

      <div className="bg-white border border-zinc-200/60 rounded-lg shadow-lg">
        <div className="p-6 border-b border-zinc-200/60 flex justify-between items-center">
          <div />
          {attrs.showGeneratedBadge && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
              🤖 AI Generated
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(schema.properties).map(([key, field]: any) => (
              <div
                key={key}
                className={
                  field.fieldType === "textarea" ? "md:col-span-2" : ""
                }
              >
                {isReadOnly ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700">
                      {field.label || key}
                    </label>
                    <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-md text-sm min-h-[2.5rem] flex items-center">
                      {field?.enumLabels?.[data[key]] || data[key] || ""}
                    </div>
                  </div>
                ) : (
                  <FieldWidget
                    field={{ ...field, key }}
                    value={data[key] ?? ""}
                    onChange={(k, v) => setData((d) => ({ ...d, [k]: v }))}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-zinc-200/60">
            <div className="flex flex-wrap gap-3">
              {/* Główny przycisk Save */}
              {attrs?.onSubmit && (
                <button
                  onClick={handleSaveToDatabase}
                  disabled={saving || savingToDb}
                  className="bg-green-600 text-white px-6 py-2.5 text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving || savingToDb ? "Saving..." : "💾 Save"}
                </button>
              )}

              {/* Dodatkowe akcje */}
              {attrs?.additionalActions?.map((action, i) => {
                const variants = {
                  primary: "bg-blue-600 text-white hover:bg-blue-700",
                  secondary: "bg-zinc-600 text-white hover:bg-zinc-700",
                  outline:
                    "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50",
                  danger: "bg-red-600 text-white hover:bg-red-700",
                };

                return (
                  <button
                    key={i}
                    onClick={() => handleAdditionalAction(action)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                      variants[action.variant || "outline"]
                    }`}
                  >
                    {action.label}
                  </button>
                );
              })}

              {/* Cancel button */}
              {attrs?.onCancel && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2.5 text-sm font-medium text-zinc-700 border border-zinc-300/80 rounded-md hover:bg-zinc-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
