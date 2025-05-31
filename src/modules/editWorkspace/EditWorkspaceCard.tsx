// src/modules/editWorkspace/EditWorkspaceCard.tsx (Simplified)
import React, { useEffect } from "react";
import { useEngineStore } from "@/core/hooks/useEngineStore";
import { configDB } from "@/provideDB/indexedDB/config";
import { FieldWidget } from "@/themes/default/widgets/form/FieldWidget";

interface WorkspaceInfo {
  slug: string;
  name: string;
  scenarios: any[];
}

interface EditWorkspaceCardProps {
  workspace: WorkspaceInfo;
  configName: string;
  onClose: () => void;
  onSave?: (updatedWorkspace: WorkspaceInfo) => void;
}

const workspaceEditSchema = {
  type: "object",
  properties: {
    slug: {
      type: "string",
      label: "Slug",
      fieldType: "text",
      required: true,
      description: "Identyfikator workspace (nie można zmieniać)"
    },
    name: {
      type: "string", 
      label: "Nazwa workspace",
      fieldType: "text",
      required: true,
      description: "Wyświetlana nazwa workspace"
    }
  }
} as const;

const EditWorkspaceCard: React.FC<EditWorkspaceCardProps> = ({
  workspace,
  configName,
  onClose,
  onSave,
}) => {
  const { get, set, reset } = useEngineStore();
  const [saving, setSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const contextKey = `editWorkspace_${workspace.slug}`;

  useEffect(() => {
    set(contextKey, {
      slug: workspace.slug,
      name: workspace.name
    });
    
    return () => {
      const currentData = get("data") || {};
      delete currentData[contextKey];
      reset();
      set("data", currentData);
    };
  }, [workspace, contextKey, set, reset, get]);

  const formData = get(contextKey) || {};

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = "Nazwa jest wymagana";
    } else if (formData.name.length < 3) {
      errors.name = "Nazwa musi mieć co najmniej 3 znaki";
    } else if (formData.name.length > 50) {
      errors.name = "Nazwa nie może przekraczać 50 znaków";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const configKey = `${configName}:/src/_configs/${configName}/workspaces/${workspace.slug}.json`;
      
      let currentConfig = await configDB.records.get(configKey);
      
      if (!currentConfig) {
        currentConfig = {
          id: configKey,
          data: {
            slug: workspace.slug,
            name: workspace.name,
            templateSettings: { layoutFile: "Simple", widgets: [] },
            contextSchema: {}
          },
          updatedAt: new Date()
        };
      }

      const updatedConfig = {
        ...currentConfig.data,
        name: formData.name,
      };

      await configDB.records.put({
        id: configKey,
        data: updatedConfig,
        updatedAt: new Date(),
      });

      const updatedWorkspace = { ...workspace, name: formData.name };
      onSave?.(updatedWorkspace);
      
      setTimeout(() => onClose(), 600);
    } catch (error) {
      console.error("Błąd podczas zapisywania workspace:", error);
      alert(`Błąd podczas zapisywania: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    set(contextKey, { ...formData, [key]: value });
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed ml-10 left-96 top-10 z-60 w-4/12 bg-white rounded-lg shadow-xl border border-zinc-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Edycja workspace</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100" type="button">
          ✖
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Slug</label>
          <input
            type="text"
            value={formData.slug || ""}
            disabled
            className="mt-1 w-full px-3 py-2 text-sm border border-zinc-300 rounded-md bg-zinc-100 text-zinc-500"
          />
          <p className="text-xs text-zinc-500 mt-1">Slug nie może być zmieniany</p>
        </div>

        <div>
          <FieldWidget
            field={{
              ...workspaceEditSchema.properties.name,
              key: "name",
              error: fieldErrors.name,
            }}
            value={formData.name || ""}
            onChange={handleFieldChange}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200 disabled:opacity-50" disabled={saving}>
            Anuluj
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 text-white rounded transition-all duration-200 ${
              saving ? "bg-zinc-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Zapisywanie..." : "Zapisz"}
          </button>
        </div>
      </form>
    </div>
  );
};
export default EditWorkspaceCard;