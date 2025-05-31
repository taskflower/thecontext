// src/modules/editWorkspace/EditWorkspaceCard.tsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
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
  configName?: string; // Made optional, will fallback to params
  onClose: () => void;
  onSave?: (updatedWorkspace: WorkspaceInfo) => void;
}

// Schema dla formularza edycji workspace
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
  configName: propConfigName,
  onClose,
  onSave,
}) => {
  const params = useParams<{ config: string }>();
  const { get, set, reset } = useEngineStore();
  const [saving, setSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Get configName from props or URL params
  const configName = propConfigName || params.config || "exampleTicketApp";
  
  console.log("🔧 EditWorkspaceCard - configName:", configName, "workspace:", workspace.slug);

  const contextKey = `editWorkspace_${workspace.slug}`;

  // Initialize form data
  useEffect(() => {
    set(contextKey, {
      slug: workspace.slug,
      name: workspace.name
    });
    
    return () => {
      // Cleanup context on unmount
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

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const configKey = `${configName}:/src/_configs/${configName}/workspaces/${workspace.slug}.json`;
      
      console.log(`🔍 Saving workspace with configName: '${configName}', key: '${configKey}'`);
      
      // Get current workspace config from cache
      let currentConfig = await configDB.records.get(configKey);
      
      if (!currentConfig) {
        console.log(`⚠️ Nie znaleziono konfiguracji w cache, tworzę nową strukturę dla workspace: ${workspace.slug}`);
        
        // Create basic workspace structure if not found
        currentConfig = {
          id: configKey,
          data: {
            slug: workspace.slug,
            name: workspace.name,
            templateSettings: {
              layoutFile: "Simple",
              widgets: []
            },
            contextSchema: {}
          },
          updatedAt: new Date()
        };
        
        // Save initial structure
        await configDB.records.put(currentConfig);
        console.log(`✅ Utworzono podstawową strukturę workspace`);
      }

      // Update workspace data
      const updatedConfig = {
        ...currentConfig.data,
        name: formData.name,
      };

      // Save to IndexedDB cache
      await configDB.records.put({
        id: configKey,
        data: updatedConfig,
        updatedAt: new Date(),
      });

      console.log(`✅ Zaktualizowano workspace ${workspace.slug}:`, {
        oldName: workspace.name,
        newName: formData.name,
      });

      // Create updated workspace info for callback
      const updatedWorkspace = {
        ...workspace,
        name: formData.name,
      };

      // Call optional save callback
      onSave?.(updatedWorkspace);
      
      // Success animation
      const button = document.querySelector("#submit-button") as HTMLButtonElement;
      if (button) {
        button.classList.add("animate-pulse");
        setTimeout(() => button.classList.remove("animate-pulse"), 500);
      }

      // Close after short delay
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
    
    // Clear error when user starts typing
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
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100"
          type="button"
        >
          ✖
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Slug
          </label>
          <input
            type="text"
            value={formData.slug || ""}
            disabled
            className="mt-1 w-full px-3 py-2 text-sm border border-zinc-300 rounded-md bg-zinc-100 text-zinc-500"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Slug nie może być zmieniany
          </p>
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
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200 disabled:opacity-50"
            disabled={saving}
          >
            Anuluj
          </button>
          <button
            id="submit-button"
            type="submit"
            disabled={saving}
            className={`px-4 py-2 text-white rounded transition-all duration-200 ${
              saving
                ? "bg-zinc-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? (
              <div className="flex items-center">
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
                Zapisywanie...
              </div>
            ) : (
              "Zapisz"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditWorkspaceCard;