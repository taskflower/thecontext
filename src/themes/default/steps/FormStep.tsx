// src/themes/default/steps/FormStep.tsx - FIXED VERSION
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceSchema, useEngineStore, useAppNavigation } from "@/core";
import { FieldWidget } from "../widgets/form/FieldWidget";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";
import { useCollections } from "@/core/hooks/useCollections";

interface FormStepProps {
  attrs: {
    schemaPath: string;
    title?: string;
    description?: string;
    onSubmit?: {
      collection?: string;
      navURL?: string;
      saveToContext?: boolean;
      contextKey?: string;
      action?: "create" | "update";
    };
    onCancel?: {
      navURL: string;
    };
    loadFromParams?: boolean;
    loadFromContext?: string;
    excludeFields?: string[];
    autoPopulateFromCurrentUser?: boolean;
  };
}

export default function FormStep({ attrs }: FormStepProps) {
  const params = useParams<{ id: string; config: string; workspace: string }>();
  const { go } = useAppNavigation();
  const editId = params.id;

  const { schema, loading, error } = useWorkspaceSchema(
    attrs?.schemaPath || ""
  );
  
  // Only initialize collections hook if we have a collection specified
  const collectionName = attrs?.onSubmit?.collection || "";
  const { items, saveItem } = useCollections(collectionName);
  const { get, set } = useEngineStore();
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const contextKey = attrs?.onSubmit?.contextKey || attrs?.schemaPath || "formData";

  // Initialize data when schema loads
  useEffect(() => {
    if (!schema?.properties) return;

    const defaults = Object.fromEntries(
      Object.entries(schema.properties).map(([key, field]: any) => [
        key,
        field.default,
      ])
    );

    let initialData = defaults;

    // Ładowanie z określonego kontekstu
    if (attrs?.loadFromContext) {
      const contextData = get(attrs.loadFromContext);
      if (contextData) {
        initialData = { ...initialData, ...contextData };
      }
    }
    // Ładowanie z kontekstu domyślnego
    else {
      const contextData = get(contextKey);
      if (contextData) {
        initialData = { ...initialData, ...contextData };
      }
    }

    // Ładowanie z parametrów (edycja)
    if (attrs?.loadFromParams && editId) {
      const existing = items.find((item: any) => item.id === editId);
      if (existing) {
        initialData = { ...initialData, ...existing };
      }
    }

    // Auto-wypełnianie z currentUser
    if (attrs?.autoPopulateFromCurrentUser) {
      const currentUser = get("currentUser");
      if (currentUser) {
        const userMapping: Record<string, string> = {
          firstName: "firstName",
          lastName: "lastName",
          email: "email",
          phone: "phone",
          role: "role",
          department: "department",
        };

        Object.entries(userMapping).forEach(([userField, formField]) => {
          if (currentUser[userField] && schema.properties[formField]) {
            initialData[formField] = currentUser[userField];
          }
        });

        if (schema.properties.reporterId || schema.properties.userId) {
          const userIdField = schema.properties.reporterId
            ? "reporterId"
            : "userId";
          initialData[userIdField] = currentUser.id;
        }

        if (schema.properties.reporter) {
          initialData.reporter = `${currentUser.firstName || ""} ${
            currentUser.lastName || ""
          }`.trim();
        }

        if (schema.properties.reporterEmail) {
          initialData.reporterEmail = currentUser.email;
        }
      }
    }

    setData(initialData);
  }, [
    schema,
    contextKey,
    attrs?.loadFromParams,
    attrs?.loadFromContext,
    attrs?.autoPopulateFromCurrentUser,
    editId,
    items,
    get,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...data, id: editId || Date.now().toString() };

      // Safe access to onSubmit properties with defaults
      const saveToContext = attrs?.onSubmit?.saveToContext ?? false;
      const navURL = attrs?.onSubmit?.navURL || "/main";

      if (saveToContext) {
        set(contextKey, payload);
      } else if (collectionName) {
        await saveItem(payload);
      } else {
        // If no collection specified and not saving to context, just save to context as fallback
        set(contextKey, payload);
      }

      go(navURL);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Safe access with fallback
    go(attrs?.onCancel?.navURL || "/main");
  };

  if (loading) return <LoadingSpinner text="Loading form..." />;
  if (error || !schema)
    return (
      <ErrorMessage error={error || `Schema not found: ${attrs?.schemaPath}`} />
    );

  return (
    <div className="max-w-xl mx-auto">
      {(attrs?.title || attrs?.description) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-zinc-900">
            {attrs.title || (editId ? "Edit Record" : "New Record")}
          </h2>
          {attrs?.description && (
            <p className="text-zinc-600 mt-1 text-sm">{attrs.description}</p>
          )}
        </div>
      )}

      <div className="bg-white border border-zinc-200/60 rounded-lg">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {Object.entries(schema.properties)
              .filter(([key]) => !attrs?.excludeFields?.includes(key))
              .map(([key, field]) => (
                <FieldWidget
                  key={key}
                  field={{ ...field, key }}
                  value={data[key] ?? ""}
                  onChange={(k, v) => setData((d) => ({ ...d, [k]: v }))}
                />
              ))}
          </div>
          <div
            className={`${
              attrs?.onCancel ? "flex gap-3" : "flex justify-end"
            } mt-8 pt-6 border-t border-zinc-200/60`}
          >
            {attrs?.onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 text-sm font-medium text-zinc-700 border border-zinc-300/80 rounded-md hover:bg-zinc-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className={`${
                attrs?.onCancel ? "flex-1" : "px-8"
              } bg-zinc-900 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-zinc-800 disabled:opacity-50`}
            >
              {saving
                ? "Saving..."
                : attrs?.onSubmit?.saveToContext
                ? "Continue"
                : editId
                ? "Update"
                : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}