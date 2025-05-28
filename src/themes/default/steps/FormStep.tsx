// src/themes/default/steps/FormStep.tsx - ENHANCED VERSION
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceSchema, useCollections, useEngineStore, useAppNavigation } from "@/core";
import { FieldWidget } from "../widgets/form/FieldWidget";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";

interface FormStepProps {
  attrs: {
    schemaPath: string;
    title?: string;
    description?: string;
    onSubmit: {
      collection?: string;
      navPath: string;
      saveToContext?: boolean;
      contextKey?: string;
    };
    loadFromParams?: boolean;
    loadFromContext?: string; // NOWE: ścieżka kontekstu do załadowania danych
    excludeFields?: string[];
    autoPopulateFromCurrentUser?: boolean; // NOWE: auto-wypełnianie z currentUser
  };
}

export default function FormStep({ attrs }: FormStepProps) {
  // ✅ ALL HOOKS AT TOP LEVEL
  const params = useParams<{ id: string; config: string; workspace: string }>();
  const { go } = useAppNavigation();
  const editId = params.id;

  const { schema, loading, error } = useWorkspaceSchema(attrs?.schemaPath || "");
  const { items, saveItem } = useCollections(attrs.onSubmit?.collection || "");
  const { get, set } = useEngineStore();
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const contextKey = attrs.onSubmit?.contextKey || attrs.schemaPath;

  // Initialize data when schema loads
  useEffect(() => {
    if (!schema?.properties) return;
    
    const defaults = Object.fromEntries(
      Object.entries(schema.properties).map(([key, field]: any) => [key, field.default])
    );

    let initialData = defaults;

    // NOWE: Ładowanie z określonego kontekstu
    if (attrs.loadFromContext) {
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
    if (attrs.loadFromParams && editId) {
      const existing = items.find((item: any) => item.id === editId);
      if (existing) {
        initialData = { ...initialData, ...existing };
      }
    }

    // NOWE: Auto-wypełnianie z currentUser
    if (attrs.autoPopulateFromCurrentUser) {
      const currentUser = get("currentUser");
      if (currentUser) {
        // Mapowanie pól currentUser na pola formularza
        const userMapping: Record<string, string> = {
          firstName: "firstName",
          lastName: "lastName", 
          email: "email",
          phone: "phone",
          role: "role",
          department: "department",
          // Dodaj więcej mapowań według potrzeb
        };

        Object.entries(userMapping).forEach(([userField, formField]) => {
          if (currentUser[userField] && schema.properties[formField]) {
            initialData[formField] = currentUser[userField];
          }
        });

        // Specjalne pole dla ID użytkownika
        if (schema.properties.reporterId || schema.properties.userId) {
          const userIdField = schema.properties.reporterId ? "reporterId" : "userId";
          initialData[userIdField] = currentUser.id;
        }

        // Specjalne pole dla nazwy użytkownika
        if (schema.properties.reporter) {
          initialData.reporter = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
        }

        // Auto-wypełnij email reportera
        if (schema.properties.reporterEmail) {
          initialData.reporterEmail = currentUser.email;
        }
      }
    }

    setData(initialData);
  }, [schema, contextKey, attrs.loadFromParams, attrs.loadFromContext, attrs.autoPopulateFromCurrentUser, editId, items, get]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = { ...data, id: editId || Date.now().toString() };
      
      if (attrs.onSubmit.saveToContext) {
        set(contextKey, payload);
      } else {
        await saveItem(payload);
      }
      
      go(`/:config/${attrs.onSubmit.navPath}`);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    go(`/:config/${attrs.onSubmit.navPath}`);
  };

  // ✅ CONDITIONAL RENDERING AFTER ALL HOOKS
  if (loading) return <LoadingSpinner text="Loading form..." />;
  if (error || !schema) return <ErrorMessage error={error || `Schema not found: ${attrs?.schemaPath}`} />;

  return (
    <div className="max-w-xl mx-auto">
      {(attrs.title || attrs.description) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-zinc-900">
            {attrs.title || (editId ? "Edit Record" : "New Record")}
          </h2>
          {attrs.description && (
            <p className="text-zinc-600 mt-1 text-sm">{attrs.description}</p>
          )}
        </div>
      )}

      <div className="bg-white border border-zinc-200/60 rounded-lg">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {Object.entries(schema.properties)
              .filter(([key]) => !attrs.excludeFields?.includes(key))
              .map(([key, field]) => (
                <FieldWidget
                  key={key}
                  field={{ ...field, key }}
                  value={data[key] ?? ""}
                  onChange={(k, v) => setData(d => ({ ...d, [k]: v }))}
                />
              ))}
          </div>
          <div className="flex gap-3 mt-8 pt-6 border-t border-zinc-200/60">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-zinc-900 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : attrs.onSubmit.saveToContext ? "Continue" : editId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 text-sm font-medium text-zinc-700 border border-zinc-300/80 rounded-md hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}