// src/themes/test/steps/FormStep.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { configDB } from "../../../db";
import { useWorkspaceSchema } from "@/core/engine";
import { CheckboxFieldWidget, DateFieldWidget, EmailFieldWidget, NumberFieldWidget, SelectFieldWidget, TextareaFieldWidget, TextFieldWidget } from "../widgets/form";


type FormStepAttrs = {
  schemaPath: string;
  loadFromParams?: boolean;
  onSubmit: {
    collection: string;
    navPath: string;
  };
  excludeFields?: string[];
  title?: string;
  // Możliwość nadpisania widgetów dla konkretnych pól
  fieldWidgets?: {
    [fieldKey: string]: {
      widget: string;
      title?: string;
      attrs?: any;
    };
  };
};

interface FormStepProps {
  attrs: FormStepAttrs;
  ticketId?: string;
}

// Mapa dostępnych widgetów
const FIELD_WIDGETS = {
  text: TextFieldWidget,
  textarea: TextareaFieldWidget,
  select: SelectFieldWidget,
  date: DateFieldWidget,
  number: NumberFieldWidget,
  email: EmailFieldWidget,
  checkbox: CheckboxFieldWidget,
};

// Funkcja wybierająca odpowiedni widget
const renderFieldWidget = (
  fieldKey: string, 
  field: any, 
  value: any, 
  onChange: any, 
  customWidget?: { widget: string; title?: string; attrs?: any }
) => {
  let widgetType = "text"; // domyślny
  let title = field.label || fieldKey;
  let extraAttrs = {};

  // Sprawdzenie czy jest custom widget dla tego pola
  if (customWidget) {
    widgetType = customWidget.widget;
    title = customWidget.title || title;
    extraAttrs = customWidget.attrs || {};
  } else {
    // Automatyczne wykrywanie typu widgetu
    if (field.widget === "textarea") {
      widgetType = "textarea";
    } else if (field.widget === "checkbox" || field.type === "boolean") {
      widgetType = "checkbox";
    } else if (field.enum) {
      widgetType = "select";
    } else if (field.format === "date") {
      widgetType = "date";
    } else if (field.format === "email") {
      widgetType = "email";
    } else if (field.type === "number" || field.type === "integer") {
      widgetType = "number";
    }
  }

  const WidgetComponent = FIELD_WIDGETS[widgetType as keyof typeof FIELD_WIDGETS];
  
  if (!WidgetComponent) {
    console.warn(`Widget type "${widgetType}" not found for field "${fieldKey}"`);
    return null;
  }

  return (
    <WidgetComponent
      key={fieldKey}
      title={title}
      attrs={{
        fieldKey,
        field,
        value: value ?? "",
        onChange,
        ...extraAttrs,
      }}
    />
  );
};

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
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          <span className="text-sm font-medium text-zinc-600">Ładowanie formularza</span>
        </div>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="py-24 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">Błąd konfiguracji</div>
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
              
              const value = data[key];
              const customWidget = attrs.fieldWidgets?.[key];
              
              return renderFieldWidget(key, field, value, handleChange, customWidget);
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