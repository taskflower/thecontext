// src/modules/editNode/EditNodeCard.tsx
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

interface NodeInfo {
  slug: string;
  label: string;
  order: number;
  tplFile: string;
  attrs?: any;
}

interface EditNodeCardProps {
  workspace: WorkspaceInfo;
  scenario: ScenarioInfo;
  node: NodeInfo;
  configName?: string; // Made optional
  onClose: () => void;
  onSave?: (updatedNode: NodeInfo) => void;
}

// Schema dla formularza edycji node
const nodeEditSchema = {
  type: "object",
  properties: {
    path: {
      type: "string",
      label: "Ścieżka",
      fieldType: "text",
      required: false,
      description: "Lokalizacja kroku w systemie"
    },
    slug: {
      type: "string",
      label: "Slug",
      fieldType: "text",
      required: true,
      description: "Identyfikator kroku (nie można zmieniać)"
    },
    label: {
      type: "string",
      label: "Label",
      fieldType: "text",
      required: true,
      description: "Wyświetlana nazwa kroku"
    },
    order: {
      type: "number",
      label: "Kolejność (order)",
      fieldType: "number",
      required: true,
      minimum: 1,
      maximum: 99,
      description: "Określa kolejność wykonywania kroków w scenariuszu"
    },
    tplFile: {
      type: "string",
      label: "Template File",
      fieldType: "select",
      required: true,
      enum: [
        "FormStep",
        "ListTableStep", 
        "DbSummaryStep",
        "LLMGenerationStep",
        "UserLoginProcessStep",
        "InfoStep",
        "ConfirmationStep"
      ],
      enumLabels: {
        "FormStep": "FormStep - Formularz",
        "ListTableStep": "ListTableStep - Lista/Tabela", 
        "DbSummaryStep": "DbSummaryStep - Podsumowanie",
        "LLMGenerationStep": "LLMGenerationStep - AI Generator",
        "UserLoginProcessStep": "UserLoginProcessStep - Logowanie",
        "InfoStep": "InfoStep - Informacje",
        "ConfirmationStep": "ConfirmationStep - Potwierdzenie"
      },
      description: "Komponent template używany do renderowania tego kroku"
    }
  }
} as const;

const EditNodeCard: React.FC<EditNodeCardProps> = ({
  workspace,
  scenario,
  node,
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
  
  console.log("🔧 EditNodeCard - configName:", configName);

  const contextKey = `editNode_${workspace.slug}_${scenario.slug}_${node.slug}`;

  // Initialize form data
  useEffect(() => {
    set(contextKey, {
      path: `${workspace.name} → ${scenario.name} → ${node.slug}`,
      slug: node.slug,
      label: node.label,
      order: node.order,
      tplFile: node.tplFile
    });
    
    return () => {
      // Cleanup context on unmount
      const currentData = get("data") || {};
      delete currentData[contextKey];
      reset();
      set("data", currentData);
    };
  }, [workspace, scenario, node, contextKey, set, reset, get]);

  const formData = get(contextKey) || {};

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.label?.trim()) {
      errors.label = "Label jest wymagany";
    } else if (formData.label.length < 2) {
      errors.label = "Label musi mieć co najmniej 2 znaki";
    } else if (formData.label.length > 100) {
      errors.label = "Label nie może przekraczać 100 znaków";
    }

    if (!formData.order) {
      errors.order = "Kolejność jest wymagana";
    } else if (formData.order < 1) {
      errors.order = "Kolejność musi być większa od 0";
    } else if (formData.order > 99) {
      errors.order = "Kolejność nie może przekraczać 99";
    }

    if (!formData.tplFile?.trim()) {
      errors.tplFile = "Template file jest wymagany";
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

      // Update the specific node in the nodes array
      const updatedNodes = currentConfig.data.nodes?.map((n: any) => 
        n.slug === node.slug 
          ? {
              ...n,
              label: formData.label,
              order: parseInt(formData.order.toString()),
              tplFile: formData.tplFile,
            }
          : n
      ) || [];

      // Sort nodes by order
      updatedNodes.sort((a: any, b: any) => a.order - b.order);

      const updatedConfig = {
        ...currentConfig.data,
        nodes: updatedNodes,
      };

      // Save to IndexedDB cache
      await configDB.records.put({
        id: configKey,
        data: updatedConfig,
        updatedAt: new Date(),
      });

      console.log(`✅ Zaktualizowano node ${workspace.slug}/${scenario.slug}/${node.slug}:`, {
        oldLabel: node.label,
        newLabel: formData.label,
        oldOrder: node.order,
        newOrder: formData.order,
        oldTplFile: node.tplFile,
        newTplFile: formData.tplFile,
      });

      // Create updated node info for callback
      const updatedNode = {
        ...node,
        label: formData.label,
        order: parseInt(formData.order.toString()),
        tplFile: formData.tplFile,
      };

      // Call optional save callback
      onSave?.(updatedNode);
      
      // Success animation
      const button = document.querySelector("#submit-button") as HTMLButtonElement;
      if (button) {
        button.classList.add("animate-pulse");
        setTimeout(() => button.classList.remove("animate-pulse"), 500);
      }

      // Close after short delay
      setTimeout(() => onClose(), 600);
      
    } catch (error) {
      console.error("Błąd podczas zapisywania node:", error);
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
        <h3 className="text-lg font-semibold">Edycja kroku</h3>
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
              ...nodeEditSchema.properties.path,
              key: "path",
            }}
            value={formData.path || ""}
            onChange={() => {}} // Read-only
          />
          <div className="mt-1">
            <div className="text-sm text-zinc-600 bg-zinc-50 p-2 rounded">
              {formData.path}
            </div>
          </div>
        </div>

        <div>
          <FieldWidget
            field={{
              ...nodeEditSchema.properties.slug,
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
              ...nodeEditSchema.properties.label,
              key: "label",
              error: fieldErrors.label,
            }}
            value={formData.label || ""}
            onChange={handleFieldChange}
          />
        </div>

        <div>
          <FieldWidget
            field={{
              ...nodeEditSchema.properties.order,
              key: "order",
              error: fieldErrors.order,
            }}
            value={formData.order || ""}
            onChange={handleFieldChange}
          />
        </div>

        <div>
          <FieldWidget
            field={{
              ...nodeEditSchema.properties.tplFile,
              key: "tplFile",
              error: fieldErrors.tplFile,
            }}
            value={formData.tplFile || ""}
            onChange={handleFieldChange}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-blue-700 text-sm">
            <strong>Popularne templates:</strong><br />
            <span className="text-xs">
              FormStep (formularze), ListTableStep (listy), DbSummaryStep (podsumowania), LLMGenerationStep (AI)
            </span>
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

export default EditNodeCard;