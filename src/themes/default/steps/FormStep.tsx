// src/themes/default/steps/FormStep.tsx - Fixed hooks order
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceSchema, useCollections } from "@/core";
import { FieldWidget } from "../widgets/form/FieldWidget";
import type { ScenarioNode } from "@/core/types";

interface FormStepProps {
  attrs: ScenarioNode['attrs'] & {
    onSubmit: {
      collection: string;
      navPath: string;
      action?: "create" | "update";
    };
  };
  ticketId?: string;
}

export default function FormStep({ attrs, ticketId }: FormStepProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string; config: string; workspace: string }>();
  const editId = ticketId || params.id;

  // ✅ ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL RETURNS
  const { schema, loading, error } = useWorkspaceSchema(attrs?.schemaPath || "");
  const { items, saveItem, loading: itemsLoading } = useCollections(attrs?.onSubmit?.collection || "");
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // ✅ Now we can do conditional returns AFTER all hooks are called
  if (!attrs) {
    return (
      <div className="py-24 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">Configuration Error</div>
        <div className="text-xs text-zinc-500">Missing form attributes</div>
        <div className="mt-4">
          <button 
            onClick={() => window.history.back()}
            className="text-blue-600 hover:underline"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!attrs.schemaPath) {
    return (
      <div className="py-24 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">Configuration Error</div>
        <div className="text-xs text-zinc-500">Missing schemaPath in form configuration</div>
      </div>
    );
  }

  if (!attrs.onSubmit?.collection) {
    return (
      <div className="py-24 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">Configuration Error</div>
        <div className="text-xs text-zinc-500">Missing onSubmit.collection in form configuration</div>
        <div className="mt-2 text-xs text-gray-400">
          Expected: attrs.onSubmit.collection
        </div>
      </div>
    );
  }

  // Initialize defaults and load record
  useEffect(() => {
    if (!schema?.properties) return;
    
    const defaults: any = {};
    Object.entries(schema.properties).forEach(([key, field]) => {
      if (field.default != null) defaults[key] = field.default;
    });
    setData(defaults);

    // Load existing record if editing
    if (attrs.loadFromParams && editId && !itemsLoading) {
      const existingRecord = items.find(item => (item as any).id === editId);
      if (existingRecord) {
        setData(prev => ({ ...prev, ...existingRecord }));
      } else if (items.length > 0) { // Only show error if items are loaded
        alert("Record not found");
        navigate(`/${params.config}/${attrs.onSubmit.navPath}`);
      }
    }
  }, [schema, editId, items, itemsLoading, attrs.loadFromParams, attrs.onSubmit.navPath, navigate, params.config]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      <span className="ml-3 text-sm font-medium text-zinc-600">Loading form...</span>
    </div>
  );

  if (error || !schema) return (
    <div className="py-24 text-center">
      <div className="text-red-600 text-sm font-medium mb-2">Schema Error</div>
      <div className="text-xs text-zinc-500">{error || `Schema not found: ${attrs.schemaPath}`}</div>
      <div className="mt-4">
        <button 
          onClick={() => window.history.back()}
          className="text-blue-600 hover:underline"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveItem({ ...data, id: editId || Date.now().toString() });
      navigate(`/${params.config}/${attrs.onSubmit.navPath}`);
    } catch (err: any) {
      console.error("Save error:", err);
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white border border-zinc-200/60 rounded-lg">
        <div className="p-6 border-b border-zinc-200/60">
          <h2 className="text-xl font-semibold text-zinc-900">
            {attrs.title || (editId ? "Edit Record" : "New Record")}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-3 bg-zinc-50 rounded text-xs font-mono text-zinc-600">
              Debug: editId={editId}, schemaPath={attrs.schemaPath}, collection={attrs.onSubmit.collection}
            </div>
          )}
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
              className="flex-1 bg-zinc-900 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-zinc-800 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : editId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/${params.config}/${attrs.onSubmit.navPath}`)}
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