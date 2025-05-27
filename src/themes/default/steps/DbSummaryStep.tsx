// src/themes/default/steps/DbSummaryStep.tsx - New step for final review and save
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceSchema, useCollections, useEngineStore } from "@/core";
import { FieldWidget } from "../widgets/form/FieldWidget";

interface DbSummaryStepProps {
  attrs: {
    schemaPath: string;
    collection: string;
    contextKey?: string;
    title?: string;
    description?: string;
    navPath?: string; // Where to go after successful save
    cancelNavPath?: string;
    allowEdit?: boolean; // Allow editing fields before save
    showGeneratedBadge?: boolean; // Show that data was AI generated
    readOnly?: boolean; // Make all fields read-only
    additionalActions?: Array<{
      type: "regenerate" | "cancel" | "custom";
      label: string;
      navPath: string;
      variant?: "primary" | "secondary" | "outline" | "danger";
    }>;
  };
}

export default function DbSummaryStep({ attrs }: DbSummaryStepProps) {
  const navigate = useNavigate();
  const { config = "exampleTicketApp", workspace = "", id } = useParams<{
    config: string;
    workspace: string;
    id: string;
  }>();

  // ✅ ALL HOOKS MUST BE CALLED FIRST
  const { schema, loading, error } = useWorkspaceSchema(attrs?.schemaPath || "");
  const { saveItem, loading: savingToDb } = useCollections(attrs?.collection || "");
  const { get, set } = useEngineStore();
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [hasContextData, setHasContextData] = useState(false);

  // Load data from context on mount
  useEffect(() => {
    if (!schema?.properties) return;

    const contextKey = attrs?.contextKey || attrs.schemaPath;
    const contextData = get(contextKey);
    
    if (contextData) {
      setData(contextData);
      setHasContextData(true);
      console.log(`DbSummary: Loaded from context: ${contextKey}`, contextData);
    } else {
      console.warn(`DbSummary: No data found in context: ${contextKey}`);
      setHasContextData(false);
    }
  }, [schema, attrs?.contextKey, attrs?.schemaPath, get]);

  // ✅ Configuration validation after hooks
  if (!attrs) {
    return (
      <div className="py-24 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">Configuration Error</div>
        <div className="text-xs text-zinc-500">Missing DbSummary attributes</div>
      </div>
    );
  }

  if (!attrs.collection) {
    return (
      <div className="py-24 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">Configuration Error</div>
        <div className="text-xs text-zinc-500">Missing collection in DbSummary configuration</div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      <span className="ml-3 text-sm font-medium text-zinc-600">Loading summary...</span>
    </div>
  );

  if (error || !schema) return (
    <div className="py-24 text-center">
      <div className="text-red-600 text-sm font-medium mb-2">Schema Error</div>
      <div className="text-xs text-zinc-500">{error || `Schema not found: ${attrs.schemaPath}`}</div>
    </div>
  );

  if (!hasContextData) {
    return (
      <div className="py-24 text-center">
        <div className="text-yellow-600 text-sm font-medium mb-2">No Data Found</div>
        <div className="text-xs text-zinc-500 mb-4">
          No data found in context: {attrs?.contextKey || attrs.schemaPath}
        </div>
        <div className="space-x-3">
          <button
            onClick={() => navigate(`/${config}/${workspace}/llm-create/new`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🤖 Generate New Data
          </button>
          <button
            onClick={() => navigate(`/${config}/${workspace}/create/new`)}
            className="bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-700"
          >
            ✏️ Create Manually
          </button>
        </div>
      </div>
    );
  }

  const handleSaveToDatabase = async () => {
    setSaving(true);
    try {
      const recordId = data.id || id || Date.now().toString();
      await saveItem({ ...data, id: recordId });
      
      // Clear context data after successful save
      const contextKey = attrs?.contextKey || attrs.schemaPath;
      set(contextKey, null);
      
      // Navigate to success page
      const navPath = attrs?.navPath || `${workspace}/list/view`;
      navigate(`/${config}/${navPath}`);
    } catch (err: any) {
      console.error("Database save error:", err);
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const cancelPath = attrs?.cancelNavPath || `${workspace}/list/view`;
    navigate(`/${config}/${cancelPath}`);
  };

  const handleAdditionalAction = (action: any) => {
    if (action.type === "regenerate") {
      // Clear context and go back to generation
      const contextKey = attrs?.contextKey || attrs.schemaPath;
      set(contextKey, null);
    }
    navigate(`/${config}/${action.navPath}`);
  };

  const getFieldDisplayValue = (key: string, value: any) => {
    const field = schema?.properties?.[key];
    return field?.type === 'boolean' ? (value ? 'Tak' : 'Nie') :
           field?.enumLabels?.[value] || value || '';
  };

  const isReadOnly = attrs?.readOnly || !attrs?.allowEdit;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-zinc-200/60 rounded-lg shadow-lg">
        <div className="p-6 border-b border-zinc-200/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                {attrs.title || "📋 Review & Save"}
              </h2>
              {attrs.description && (
                <p className="text-zinc-600 mt-1 text-sm">{attrs.description}</p>
              )}
            </div>
            {attrs.showGeneratedBadge && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                🤖 AI Generated
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-3 bg-zinc-50 rounded text-xs font-mono text-zinc-600">
              Debug: contextKey={attrs?.contextKey || attrs.schemaPath}, 
              collection={attrs.collection}, 
              hasData={hasContextData}, 
              allowEdit={attrs?.allowEdit}
            </div>
          )}

          <div className="space-y-6">
            {/* Data Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(schema.properties)
                .map(([key, field]: any) => (
                  <div 
                    key={key} 
                    className={field.fieldType === "textarea" ? "md:col-span-2" : ""}
                  >
                    {isReadOnly ? (
                      // Read-only display
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-700">
                          {field.label || key}
                        </label>
                        <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-md text-sm min-h-[2.5rem] flex items-center">
                          {getFieldDisplayValue(key, data[key])}
                        </div>
                      </div>
                    ) : (
                      // Editable field
                      <FieldWidget
                        field={{ ...field, key }}
                        value={data[key] ?? ""}
                        onChange={(k, v) => setData(d => ({ ...d, [k]: v }))}
                      />
                    )}
                  </div>
                ))}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-zinc-200/60">
              <div className="flex flex-wrap gap-3">
                {/* Primary save action */}
                <button
                  onClick={handleSaveToDatabase}
                  disabled={saving || savingToDb}
                  className="bg-green-600 text-white px-6 py-2.5 text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving || savingToDb ? (
                    <>
                      <span className="inline-flex animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      💾 Save to Database
                    </>
                  )}
                </button>

                {/* Additional actions */}
                {attrs.additionalActions?.map((action, i) => {
                  const variantClasses = {
                    primary: "bg-blue-600 text-white hover:bg-blue-700",
                    secondary: "bg-zinc-600 text-white hover:bg-zinc-700", 
                    outline: "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50",
                    danger: "bg-red-600 text-white hover:bg-red-700"
                  };
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handleAdditionalAction(action)}
                      className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        variantClasses[action.variant || "outline"]
                      }`}
                    >
                      {action.label}
                    </button>
                  );
                })}

                {/* Cancel action */}
                <button
                  onClick={handleCancel}
                  className="px-4 py-2.5 text-sm font-medium text-zinc-700 border border-zinc-300/80 rounded-md hover:bg-zinc-50"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Context Debug Info */}
            {process.env.NODE_ENV === "development" && (
              <div className="pt-4 border-t border-zinc-100">
                <details className="text-xs">
                  <summary className="text-zinc-500 cursor-pointer">Debug: Context Data</summary>
                  <pre className="mt-2 p-3 bg-zinc-50 rounded text-zinc-600 overflow-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}