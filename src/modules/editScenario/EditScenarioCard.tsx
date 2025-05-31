// src/modules/editScenario/EditScenarioCard.tsx
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

interface ScenarioInfo {
  slug: string;
  name: string;
  nodes: any[];
}

interface EditScenarioCardProps {
  workspace: WorkspaceInfo;
  scenario: ScenarioInfo;
  configName?: string; // Made optional
  onClose: () => void;
  onSave?: (updatedScenario: ScenarioInfo) => void;
}

// Schema dla formularza edycji scenariusza
const scenarioEditSchema = {
  type: "object",
  properties: {
    workspaceName: {
      type: "string",
      label: "Workspace",
      fieldType: "text",
      required: false,
      description: "Workspace zawierający ten scenariusz"
    },
    slug: {
      type: "string",
      label: "Slug",
      fieldType: "text",
      required: true,
      description: "Identyfikator scenariusza (nie można zmieniać)"
    },
    name: {
      type: "string",
      label: "Nazwa scenariusza",
      fieldType: "text",
      required: true,
      description: "Wyświetlana nazwa scenariusza"
    },
    nodeCount: {
      type: "number",
      label: "Liczba kroków",
      fieldType: "number",
      required: false,
      description: "Liczba kroków w scenariuszu"
    }
  }
} as const;

const EditScenarioCard: React.FC<EditScenarioCardProps> = ({
  workspace,
  scenario,
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
  
  console.log("🔧 EditScenarioCard - configName:", configName);

  const contextKey = `editScenario_${workspace.slug}_${scenario.slug}`;

  // Initialize form data
  useEffect(() => {
    set(contextKey, {
      workspaceName: workspace.name,
      slug: scenario.slug,
      name: scenario.name,
      nodeCount: scenario.nodes?.length || 0
    });
    
    return () => {
      // Cleanup context on unmount
      const currentData = get("data") || {};
      delete currentData[contextKey];
      reset();
      set("data", currentData);
    };
  }, [workspace, scenario, contextKey, set, reset, get]);

  const formData = get(contextKey) || {};

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = "Nazwa jest wymagana";
    } else if (formData.name.length < 2) {
      errors.name = "Nazwa musi mieć co najmniej 2 znaki";
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
      const configKey = `${configName}:/src/_configs/${configName}/scenarios/${workspace.slug}/${scenario.slug}.json`;
      
      // Get current scenario config from cache
      const currentConfig = await configDB.records.get(configKey);
      
      if (!currentConfig) {
        throw new Error("Nie znaleziono konfiguracji scenariusza");
      }

      // Update scenario data - update first node's label to match scenario name
      const updatedConfig = {
        ...currentConfig.data,
        nodes: currentConfig.data.nodes?.map((node: any, index: number) => 
          index === 0 
            ? { ...node, label: formData.name }
            : node
        ) || [],
      };

      // Save to IndexedDB cache
      await configDB.records.put({
        id: configKey,
        data: updatedConfig,
        updatedAt: new Date(),
      });

      console.log(`✅ Zaktualizowano scenariusz ${workspace.slug}/${scenario.slug}:`, {
        oldName: scenario.name,
        newName: formData.name,
      });

      // Create updated scenario info for callback
      const updatedScenario = {
        ...scenario,
        name: formData.name,
        nodes: updatedConfig.nodes,
      };

      // Call optional save callback
      onSave?.(updatedScenario);
      
      // Success animation
      const button = document.querySelector("#submit-button") as HTMLButtonElement;
      if (button) {
        button.classList.add("animate-pulse");
        setTimeout(() => button.classList.remove("animate-pulse"), 500);
      }

      // Close after short delay
      setTimeout(() => onClose(), 600);
      
    } catch (error) {
      console.error("Błąd podczas zapisywania scenariusza:", error);
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
        <h3 className="text-lg font-semibold">Edycja scenariusza</h3>
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
          <FieldWidget
            field={{
              ...scenarioEditSchema.properties.workspaceName,
              key: "workspaceName",
            }}
            value={formData.workspaceName || ""}
            onChange={() => {}} // Read-only
          />
          <div className="mt-1">
            <input
              type="text"
              value={formData.workspaceName || ""}
              disabled
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md bg-zinc-100 text-zinc-500"
            />
          </div>
        </div>

        <div>
          <FieldWidget
            field={{
              ...scenarioEditSchema.properties.slug,
              key: "slug",
            }}
            value={formData.slug || ""}
            onChange={() => {}} // Read-only
          />
          <div className="mt-1">
            <input
              type="text"
              value={formData.slug || ""}
              disabled
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md bg-zinc-100 text-zinc-500"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Slug nie może być zmieniany
            </p>
          </div>
        </div>

        <div>
          <FieldWidget
            field={{
              ...scenarioEditSchema.properties.name,
              key: "name",
              error: fieldErrors.name,
            }}
            value={formData.name || ""}
            onChange={handleFieldChange}
          />
        </div>

        <div>
          <FieldWidget
            field={{
              ...scenarioEditSchema.properties.nodeCount,
              key: "nodeCount",
            }}
            value={formData.nodeCount || 0}
            onChange={() => {}} // Read-only
          />
          <div className="mt-1">
            <input
              type="number"
              value={formData.nodeCount || 0}
              disabled
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md bg-zinc-100 text-zinc-500"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-blue-700 text-sm">
            <strong>Info:</strong> Nazwa zostanie również zaktualizowana w pierwszym kroku scenariusza.
          </p>
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

export default EditScenarioCard;