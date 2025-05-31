// src/modules/editNode/EditNodeCard.tsx (Improved)
import React from "react";
import { useNodeEdit } from "./hooks/useNodeEdit";
import { NodeForm } from "./components/NodeForm";

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
  configName: string;
  onClose: () => void;
  onSave?: (updatedNode: NodeInfo) => void;
}

const EditNodeCard: React.FC<EditNodeCardProps> = ({
  workspace,
  scenario,
  node,
  configName,
  onClose,
  onSave,
}) => {
  const {
    formData,
    errors,
    saving,
    updateField,
    saveNode
  } = useNodeEdit(workspace, scenario, node, configName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await saveNode();
    if (success) {
      const updatedNode = {
        ...node,
        label: formData.label,
        order: parseInt(formData.order.toString()),
        tplFile: formData.tplFile,
      };
      
      onSave?.(updatedNode);
      
      // Success animation and close
      const button = document.querySelector("#submit-button") as HTMLButtonElement;
      if (button) {
        button.classList.add("animate-pulse");
        setTimeout(() => button.classList.remove("animate-pulse"), 500);
      }
      
      setTimeout(() => onClose(), 600);
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

      <form onSubmit={handleSubmit}>
        <NodeForm
          formData={formData}
          errors={errors}
          onFieldChange={updateField}
        />

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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
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