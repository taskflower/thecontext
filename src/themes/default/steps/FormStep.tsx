// src/themes/default/steps/FormStep.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { configDB } from "../../../db";
import { useWorkspaceSchema } from "@/core/engine";
import { FieldWidget } from "../widgets/form/FieldWidget";

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
  ticketId?: string;
}

export default function FormStep({ attrs, ticketId }: FormStepProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string; config: string; workspace: string }>();
  const editId = ticketId || params.id;
  const { schema, loading, error } = useWorkspaceSchema(attrs.schemaPath);

  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!schema?.properties) return;
    const defaults: any = {};
    Object.entries(schema.properties).forEach(([key, field]: any) => {
      if (field.default != null) defaults[key] = field.default;
    });
    setData(defaults);
  }, [schema]);

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
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          <span className="text-sm font-medium text-zinc-600">
            Ładowanie formularza
          </span>
        </div>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="py-24 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">
          Błąd konfiguracji
        </div>
        <div className="text-xs text-zinc-500">
          {error || `Nie znaleziono schemy: ${attrs.schemaPath}`}
        </div>
      </div>
    );
  }

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
    <div className="max-w-xl mx-auto">
      <div className="bg-white border border-zinc-200/60 rounded-lg">
        <div className="p-6 border-b border-zinc-200/60">
          <h2 className="text-xl font-semibold text-zinc-900">
            {attrs.title || (editId ? "Edycja rekordu" : "Nowy rekord")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-3 bg-zinc-50 rounded text-xs font-mono text-zinc-600">
              Debug: editId={editId}, loadFromParams={attrs.loadFromParams},
              schemaPath={attrs.schemaPath}
            </div>
          )}

          <div className="space-y-5">
            {Object.entries(schema.properties).map(([key, field]: any) => {
              if (attrs.excludeFields?.includes(key)) return null;

              return (
                <FieldWidget
                  key={key}
                  field={{ ...field, key }}
                  value={data[key] ?? ""}
                  onChange={handleChange}
                />
              );
            })}
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-zinc-200/60">
            <button
              type="submit"
              className="flex-1 bg-zinc-900 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              disabled={saving}
            >
              {saving ? "Zapisywanie..." : editId ? "Zaktualizuj" : "Zapisz"}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(`/${params.config}/${attrs.onSubmit.navPath}`)
              }
              className="px-4 py-2.5 text-sm font-medium text-zinc-700 border border-zinc-300/80 rounded-md hover:bg-zinc-50 transition-colors"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
