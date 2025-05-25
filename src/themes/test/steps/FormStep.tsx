// src/themes/test/steps/FormStep.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { configDB } from "../../../db";
import { useWorkspaceSchema } from "@/core/engine";

type FormStepAttrs = {
  schemaPath: string;
  loadFromParams?: boolean;
  onSubmit: {
    collection: string;
    navPath: string;
  };
  excludeFields?: string[];
  title?: string;
};

interface FormStepProps {
  attrs: FormStepAttrs;
  ticketId?: string; // Można użyć 'string' lub 'number' w zależności od typu
}
export default function FormStep({ attrs, ticketId }: FormStepProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string; config: string; workspace: string }>();
  const editId = ticketId || params.id;
  const { schema, loading, error } = useWorkspaceSchema(attrs.schemaPath);

  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Domyślne wartości
  useEffect(() => {
    if (!schema?.properties) return;
    const defaults: any = {};
    Object.entries(schema.properties).forEach(([key, field]: any) => {
      if (field.default != null) defaults[key] = field.default;
    });
    setData(defaults);
  }, [schema]);

  // Ładowanie rekordu do edycji
  useEffect(() => {
    if (!schema || !attrs.loadFromParams || !editId) return;
    (async () => {
      try {
        const rec = await configDB.records.get(
          `${attrs.onSubmit.collection}:${editId}`
        );
        if (rec) setData(rec.data);
        else {
          alert("Rekord nie został znaleziony");
          navigate(`/${params.config}/${attrs.onSubmit.navPath}`);
        }
      } catch (e) {
        console.error(e);
        alert("Błąd podczas ładowania rekordu");
      }
    })();
  }, [schema, editId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2" />
        <span className="text-gray-600">Ładowanie formularza...</span>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Błąd konfiguracji</div>
        <div className="text-sm text-gray-500">
          {error || `Nie znaleziono schemy: ${attrs.schemaPath}`}
        </div>
      </div>
    );
  }

  const getFieldLabel = (key: string, field: any) => field.label || key;
  const getSelectOptions = (enumVals: string[], field: any) =>
    enumVals.map((v) => ({ value: v, label: field.enumLabels?.[v] || v }));

  const handleChange = (key: string, value: any) =>
    setData((d) => ({ ...d, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = editId || Date.now().toString();
      await configDB.records.put({
        id: `${attrs.onSubmit.collection}:${id}`,
        data: { ...data, id },
        updatedAt: new Date(),
      });
      navigate(`/${params.config}/${attrs.onSubmit.navPath}`);
    } catch {
      alert("Błąd podczas zapisywania rekordu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {attrs.title || (editId ? "Edytuj rekord" : "Nowy rekord")}
        </h2>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            Debug: editId={editId}, loadFromParams={attrs.loadFromParams},
            schemaPath={attrs.schemaPath}
          </div>
        )}

        {Object.entries(schema.properties).map(([key, field]: any) => {
          if (attrs.excludeFields?.includes(key)) return null;
          const value = data[key] ?? "";
          return (
            <div key={key} className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {getFieldLabel(key, field)}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.enum ? (
                <select
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={field.required}
                >
                  <option value="">Wybierz...</option>
                  {getSelectOptions(field.enum, field).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.widget === "textarea" ? (
                <textarea
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required={field.required}
                />
              ) : field.format === "date" ? (
                <input
                  type="date"
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={field.required}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={field.required}
                />
              )}
            </div>
          );
        })}

        <div className="flex gap-3 mt-8">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Zapisywanie..." : editId ? "Zaktualizuj" : "Zapisz"}
          </button>
          <button
            type="button"
            onClick={() =>
              navigate(`/${params.config}/${attrs.onSubmit.navPath}`)
            }
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}
