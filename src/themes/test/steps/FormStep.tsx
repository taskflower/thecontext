// src/themes/test/steps/FormStep.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { configDB } from "../../../db";
import { useConfig } from "../../../core/engine";

export default function FormStep({ attrs, ticketId }: any) {
  const navigate = useNavigate();
  const params = useParams();
  const { config, workspace } = params;

  // Pobierz konfigurację workspace dla schemy
  const workspaceConfig = useConfig(
    config || "exampleTicketApp",
    `/src/_configs/${config || "exampleTicketApp"}/workspaces/${workspace}.json`
  );

  const editId = ticketId || params.id;
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pobierz schemat z konfiguracji workspace
  const getSchemaFromConfig = () => {
    if (!workspaceConfig?.contextSchema || !attrs?.schemaPath) {
      console.error("Missing schema configuration");
      return null;
    }

    const schemaPath = attrs.schemaPath;
    return workspaceConfig.contextSchema[schemaPath];
  };

  const schema = getSchemaFromConfig();

  useEffect(() => {
    console.log("FormStep mounted with:", { editId, ticketId, params, schema });

    if (editId && attrs?.loadFromParams) {
      loadRecord(editId);
    } else {
      // Set defaults for new record
      setDefaultValues();
    }
  }, [editId, schema]);

  const setDefaultValues = () => {
    if (!schema?.properties) return;

    const defaults: any = {};
    Object.entries(schema.properties).forEach(([key, field]: [string, any]) => {
      if (field.default) {
        defaults[key] = field.default;
      }
    });
    setData(defaults);
  };

  const loadRecord = async (recordId: string) => {
    try {
      setLoading(true);
      console.log("Loading record with ID:", recordId);

      const collection = attrs?.onSubmit?.collection || "records";
      const record = await configDB.records.get(`${collection}:${recordId}`);
      console.log("Loaded record:", record);

      if (record) {
        setData(record.data);
      } else {
        console.error("Record not found:", recordId);
        alert("Rekord nie został znaleziony");
        if (attrs?.onSubmit?.navPath) {
          navigate(`/${config}/${attrs.onSubmit.navPath}`);
        }
      }
    } catch (error) {
      console.error("Failed to load record:", error);
      alert("Błąd podczas ładowania rekordu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!attrs?.onSubmit) {
      console.error("No onSubmit configuration");
      return;
    }

    try {
      setSaving(true);
      const collection = attrs.onSubmit.collection;
      const recordId = editId || Date.now().toString();

      await configDB.records.put({
        id: `${collection}:${recordId}`,
        data: { ...data, id: recordId },
        updatedAt: new Date(),
      });

      navigate(`/${config}/${attrs.onSubmit.navPath}`);
    } catch (error) {
      console.error("Failed to save record:", error);
      alert("Błąd podczas zapisywania rekordu");
    } finally {
      setSaving(false);
    }
  };

  const getFieldLabel = (key: string, field: any) => {
    return field.label || key;
  };

  const getSelectOptions = (key: string, enumValues: string[], field: any) => {
    return enumValues.map((value) => ({
      value,
      label: field.enumLabels?.[value] || value,
    }));
  };

  if (!schema) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Błąd konfiguracji</div>
        <div className="text-sm text-gray-500">
          Nie znaleziono schemy: {attrs?.schemaPath || "brak schemaPath"} w
          workspace: {workspace}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Debug: config={config}, workspaceConfig=
          {workspaceConfig ? "loaded" : "null"}, attrs={JSON.stringify(attrs)}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-gray-600">Ładowanie formularza...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {attrs?.title || (editId ? "Edytuj rekord" : "Nowy rekord")}
        </h2>

        {/* DEBUG INFO */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            Debug: editId={editId}, mode={editId ? "edit" : "create"}, schema=
            {attrs?.schemaPath}
          </div>
        )}

        {Object.entries(schema.properties || {}).map(
          ([key, field]: [string, any]) => {
            // Skip excluded fields
            if (attrs?.excludeFields?.includes(key)) return null;

            return (
              <div key={key} className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {getFieldLabel(key, field)}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {field.enum ? (
                  <select
                    value={data[key] || ""}
                    onChange={(e) =>
                      setData({ ...data, [key]: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={field.required}
                  >
                    <option value="">Wybierz...</option>
                    {getSelectOptions(key, field.enum, field).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.widget === "textarea" ? (
                  <textarea
                    value={data[key] || ""}
                    onChange={(e) =>
                      setData({ ...data, [key]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    required={field.required}
                  />
                ) : field.format === "date" ? (
                  <input
                    type="date"
                    value={data[key] || ""}
                    onChange={(e) =>
                      setData({ ...data, [key]: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={field.required}
                  />
                ) : (
                  <input
                    type="text"
                    value={data[key] || ""}
                    onChange={(e) =>
                      setData({ ...data, [key]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={field.required}
                  />
                )}
              </div>
            );
          }
        )}

        <div className="flex gap-3 mt-8">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Zapisywanie..." : editId ? "Zaktualizuj" : "Zapisz"}
          </button>
          <button
            type="button"
            onClick={() =>
              attrs?.onSubmit?.navPath &&
              navigate(`/${config}/${attrs.onSubmit.navPath}`)
            }
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}
