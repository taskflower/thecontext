// src/themes/default/steps/DbSummaryStep.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceSchema, useCollections, useEngineStore, useAppNavigation } from "@/core";
import { FieldWidget } from "../widgets/form/FieldWidget";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";

interface DbSummaryStepProps {
  attrs: {
    schemaPath: string;
    collection: string;
    contextKey?: string;
    title?: string;
    description?: string;
    navPath?: string;
    cancelNavPath?: string;
    allowEdit?: boolean;
    showGeneratedBadge?: boolean;
    readOnly?: boolean;
    additionalActions?: Array<{
      type: string;
      label: string;
      navPath: string;
      variant?: "primary" | "secondary" | "outline" | "danger";
    }>;
  };
}

export default function DbSummaryStep({ attrs }: DbSummaryStepProps) {
  // ✅ ALL HOOKS AT TOP LEVEL
  const { workspace = "", id } = useParams();
  const { go } = useAppNavigation(); // ✅ UŻYWAMY useAppNavigation
  
  const { schema, loading, error } = useWorkspaceSchema(attrs?.schemaPath || "");
  const { saveItem, loading: savingToDb } = useCollections(attrs?.collection || "");
  const { get, set } = useEngineStore();
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const contextKey = attrs?.contextKey || attrs.schemaPath;
  const hasContextData = !!get(contextKey);

  // Load context data when component mounts
  useEffect(() => {
    const contextData = get(contextKey);
    if (contextData) setData(contextData);
  }, [contextKey, get]);

  const handleSaveToDatabase = async () => {
    setSaving(true);
    try {
      await saveItem({ ...data, id: data.id || id || Date.now().toString() });
      set(contextKey, null); // Clear context
      const navPath = attrs?.navPath || `${workspace}/list/view`;
      go(`/:config/${navPath}`); // ✅ UŻYWAMY go() zamiast navigate()
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const cancelPath = attrs?.cancelNavPath || `${workspace}/list/view`;
    go(`/:config/${cancelPath}`); // ✅ UŻYWAMY go() zamiast navigate()
  };

  const handleAdditionalAction = (action: any) => {
    if (action.type === "regenerate") {
      set(contextKey, null);
    }
    go(`/:config/${action.navPath}`); // ✅ UŻYWAMY go() zamiast navigate()
  };

  // ✅ CONDITIONAL RENDERING AFTER ALL HOOKS
  if (loading) return <LoadingSpinner text="Loading summary..." />;
  if (error || !schema) return <ErrorMessage error={error || `Schema not found: ${attrs?.schemaPath}`} />;

  if (!hasContextData) {
    return (
      <div className="py-24 text-center">
        <div className="text-yellow-600 text-sm font-medium mb-2">No Data Found</div>
        <div className="text-xs text-zinc-500 mb-4">No data found in context: {contextKey}</div>
        <div className="space-x-3">
          <button
            onClick={() => go(`/:config/${workspace}/llm-create/new`)} // ✅ UŻYWAMY go()
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🤖 Generate New Data
          </button>
          <button
            onClick={() => go(`/:config/${workspace}/create/new`)} // ✅ UŻYWAMY go()
            className="bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-700"
          >
            ✏️ Create Manually
          </button>
        </div>
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
              <div key={key} className={field.fieldType === "textarea" ? "md:col-span-2" : ""}>
                {isReadOnly ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700">
                      {field.label || key}
                    </label>
                    <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-md text-sm min-h-[2.5rem] flex items-center">
                      {field?.enumLabels?.[data[key]] || data[key] || ''}
                    </div>
                  </div>
                ) : (
                  <FieldWidget
                    field={{ ...field, key }}
                    value={data[key] ?? ""}
                    onChange={(k, v) => setData(d => ({ ...d, [k]: v }))}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-zinc-200/60">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveToDatabase}
                disabled={saving || savingToDb}
                className="bg-green-600 text-white px-6 py-2.5 text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {saving || savingToDb ? "Saving..." : "💾 Save to Database"}
              </button>

              {attrs.additionalActions?.map((action, i) => {
                const variants = {
                  primary: "bg-blue-600 text-white hover:bg-blue-700",
                  secondary: "bg-zinc-600 text-white hover:bg-zinc-700", 
                  outline: "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50",
                  danger: "bg-red-600 text-white hover:bg-red-700"
                };
                
                return (
                  <button
                    key={i}
                    onClick={() => handleAdditionalAction(action)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${variants[action.variant || "outline"]}`}
                  >
                    {action.label}
                  </button>
                );
              })}

              <button
                onClick={handleCancel}
                className="px-4 py-2.5 text-sm font-medium text-zinc-700 border border-zinc-300/80 rounded-md hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}