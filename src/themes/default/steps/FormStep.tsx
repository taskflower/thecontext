// src/themes/default/steps/FormStep.tsx - Modern Dropbox Style
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceSchema, useEngineStore, useAppNavigation } from "@/core";
import { FieldWidget } from "../widgets/form/FieldWidget";
import { useCollections } from "@/core/hooks/useCollections";

interface FormStepProps {
  attrs: {
    schemaPath: string;
    title?: string;
    description?: string;
    onSubmit?: {
      collection?: string;
      navigationPath?: string;
      saveToContext?: boolean;
      contextKey?: string;
      action?: "create" | "update";
    };
    onCancel?: {
      navigationPath: string;
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

  const collectionName = attrs?.onSubmit?.collection || "";
  const { items, saveItem } = useCollections(collectionName);
  const { get, set } = useEngineStore();
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const contextKey =
    attrs?.onSubmit?.contextKey || attrs?.schemaPath || "formData";

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

    if (attrs?.loadFromContext) {
      const contextData = get(attrs.loadFromContext);
      if (contextData) {
        initialData = { ...initialData, ...contextData };
      }
    } else {
      const contextData = get(contextKey);
      if (contextData) {
        initialData = { ...initialData, ...contextData };
      }
    }

    if (attrs?.loadFromParams && editId) {
      const existing = items.find((item: any) => item.id === editId);
      if (existing) {
        initialData = { ...initialData, ...existing };
      }
    }

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

  const validateForm = () => {
    const errors: Record<string, string> = {};

    Object.entries(schema?.properties || {}).forEach(([key, field]: any) => {
      if (field.required && (!data[key] || data[key] === "")) {
        errors[key] = `${field.label || key} is required`;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const payload = { ...data, id: editId || Date.now().toString() };

      const saveToContext = attrs?.onSubmit?.saveToContext ?? false;
      const navigationPath = attrs?.onSubmit?.navigationPath || "/main";

      if (saveToContext) {
        set(contextKey, payload);
      } else if (collectionName) {
        await saveItem(payload);
      } else {
        set(contextKey, payload);
      }

      // Success animation
      const button = document.querySelector(
        "#submit-button"
      ) as HTMLButtonElement;
      if (button) {
        button.classList.add("animate-pulse");
        setTimeout(() => button.classList.remove("animate-pulse"), 500);
      }

      setTimeout(() => go(navigationPath), 600);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    go(attrs?.onCancel?.navigationPath || "/main");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading form configuration...
          </div>
        </div>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="text-center py-24">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Configuration Error
        </h3>
        <p className="text-slate-600 text-sm">
          {error || `Schema not found: ${attrs?.schemaPath}`}
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          {attrs?.title || (editId ? "Edit Record" : "Create New Record")}
        </h1>
        {attrs?.description && (
          <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
            {attrs.description}
          </p>
        )}
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            {Object.entries(schema.properties)
              .filter(([key]) => !attrs?.excludeFields?.includes(key))
              .map(([key, field]) => (
                <div key={key} className="group">
                  <FieldWidget
                    field={{
                      ...field,
                      key,
                      error: fieldErrors[key],
                    }}
                    value={data[key] ?? ""}
                    onChange={(k, v) => {
                      setData((d) => ({ ...d, [k]: v }));
                      // Clear error when user starts typing
                      if (fieldErrors[k]) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors[k];
                          return newErrors;
                        });
                      }
                    }}
                  />
                </div>
              ))}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-200/60">
            {attrs?.onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                Cancel
              </button>
            )}
            <button
              id="submit-button"
              type="submit"
              disabled={saving}
              className={`
                flex-1 px-6 py-3 text-sm font-medium text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${
                  saving
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                }
              `}
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </div>
              ) : attrs?.onSubmit?.saveToContext ? (
                "Continue"
              ) : editId ? (
                "Update Record"
              ) : (
                "Create Record"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
