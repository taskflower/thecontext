/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ChangeEvent } from "react";
import { PlusCircle, X, Trash2, Link } from "lucide-react";
import { useAppStore } from "./store";
import {
  SectionHeaderProps,
  DialogProps,
  ItemListProps,
  StepModalProps,
} from "./types";

// Reusable UI Components
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onAddClick,
}) => (
  <div className="flex items-center justify-between px-4 py-3 border-b">
    <div className="font-medium">{title}</div>
    <button
      className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
      onClick={onAddClick}
    >
      <PlusCircle className="h-4 w-4" />
    </button>
  </div>
);

export const EmptyState: React.FC = () => (
  <div className="py-4 text-center text-xs text-gray-500">
    No items
  </div>
);

export const Dialog: React.FC<DialogProps> = ({
  title,
  onClose,
  onAdd,
  fields,
  formData,
  onChange,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="p-4">
        <div className="grid gap-3 py-3">
          {fields.map((field) =>
            field.type === "select" ? (
              <select
                key={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select {field.placeholder} --</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={onChange}
                placeholder={field.placeholder}
                type={field.type || "text"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )
          )}
          <button
            onClick={onAdd}
            className="py-1.5 px-3 text-sm rounded-md font-medium bg-blue-500 text-white hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Modal Step Player
export const StepModal: React.FC<StepModalProps> = ({
  steps,
  currentStep,
  onNext,
  onPrev,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <div className="font-medium mb-2">
            Node: {steps[currentStep].label}
          </div>
          <div className="text-sm mb-2">Value: {steps[currentStep].value}</div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className={`px-3 py-1 rounded-md text-sm ${
              currentStep === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
            }`}
          >
            Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={onNext}
              className="px-3 py-1 rounded-md text-sm bg-blue-500 text-white hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-md text-sm bg-green-500 text-white hover:bg-green-600"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Item List Component with email-like styling
export function ItemList<T extends { id: string }>({
  items,
  selected,
  onClick,
  onDelete,
  renderItem,
}: ItemListProps<T>) {
  return (
    <div className="overflow-auto">
      <div className="divide-y">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center px-4 py-1.5 w-full cursor-pointer ${
              item.id === selected
                ? "bg-blue-50 border-l-2 border-l-blue-500"
                : "hover:bg-gray-50"
            }`}
            onClick={() => onClick(item.id)}
          >
            <div className="flex-1 truncate">
              {renderItem(item)}
            </div>
            <button
              className="p-1 text-gray-400 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <EmptyState />}
      </div>
    </div>
  );
}

// Dialog hook
export interface DialogState<T extends Record<string, any>> {
  isOpen: boolean;
  formData: T;
  openDialog: (initialData?: Partial<T>) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useDialogState<T extends Record<string, any>>(
  initialFields: T
): DialogState<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<T>(initialFields);

  const openDialog = (initialData: Partial<T> = {}) => {
    setFormData({ ...initialFields, ...initialData } as T);
    setIsOpen(true);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return { isOpen, formData, openDialog, handleChange, setIsOpen };
}

// Optimized workspace list
export const WorkspacesList: React.FC = () => {
  const items = useAppStore((state) => state.items);
  const selected = useAppStore((state) => state.selected.workspace);
  const selectWorkspace = useAppStore((state) => state.selectWorkspace);
  const deleteWorkspace = useAppStore((state) => state.deleteWorkspace);
  const addWorkspace = useAppStore((state) => state.addWorkspace);
  /* refresh */
  useAppStore((state) => state.stateVersion);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ title: "" });
  
  const onAdd = () => {
    if (formData.title) {
      addWorkspace(formData);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Workspaces"
        onAddClick={() => openDialog()}
      />
      <div className="flex-1 overflow-auto">
        <ItemList
          items={items}
          selected={selected}
          onClick={selectWorkspace}
          onDelete={deleteWorkspace}
          renderItem={(item) => <div className="text-sm">{item.title}</div>}
        />
      </div>

      {isOpen && (
        <Dialog
          title="New Workspace"
          onClose={() => setIsOpen(false)}
          onAdd={onAdd}
          fields={[{ name: "title", placeholder: "Workspace name" }]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

// Optimized scenarios list
export const ScenariosList: React.FC = () => {
  const workspace = useAppStore((state) => 
    state.items.find(w => w.id === state.selected.workspace)
  );
  const selected = useAppStore((state) => state.selected.scenario);
  const selectScenario = useAppStore((state) => state.selectScenario);
  const deleteScenario = useAppStore((state) => state.deleteScenario);
  const addScenario = useAppStore((state) => state.addScenario);
  /* refresh */
  useAppStore((state) => state.stateVersion);
  useAppStore((state) => state.selected.workspace);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ 
    name: "", 
    description: "" 
  });
  
  const scenarios = workspace?.children || [];
  
  const onAdd = () => {
    if (formData.name) {
      addScenario(formData);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Scenarios"
        onAddClick={() => openDialog()}
      />
      <div className="flex-1 overflow-auto">
        <ItemList
          items={scenarios}
          selected={selected}
          onClick={selectScenario}
          onDelete={deleteScenario}
          renderItem={(item) => (
            <>
              <div className="text-sm">{item.name}</div>
              {item.description && (
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {item.description}
                </div>
              )}
            </>
          )}
        />
      </div>

      {isOpen && (
        <Dialog
          title="New Scenario"
          onClose={() => setIsOpen(false)}
          onAdd={onAdd}
          fields={[
            { name: "name", placeholder: "Scenario name" },
            { name: "description", placeholder: "Description" },
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

// Optimized nodes list
export const NodesList: React.FC = () => {
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const selected = useAppStore((state) => state.selected.node);
  const selectNode = useAppStore((state) => state.selectNode);
  const deleteNode = useAppStore((state) => state.deleteNode);
  const addNode = useAppStore((state) => state.addNode);
  /* refresh */
  useAppStore((state) => state.stateVersion);
  useAppStore((state) => state.selected.scenario);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ 
    label: "", 
    value: "" 
  });
  
  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];
  
  const onAdd = () => {
    if (formData.label && formData.value) {
      addNode(formData);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Nodes"
        onAddClick={() => openDialog()}
      />
      <div className="flex-1 overflow-auto">
        <ItemList
          items={nodes}
          selected={selected}
          onClick={selectNode}
          onDelete={deleteNode}
          renderItem={(item) => (
            <div className="flex items-center">
              <div className="text-sm">{item.label}</div>
              <span className="ml-auto inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                {item.value}
              </span>
            </div>
          )}
        />
      </div>

      {isOpen && (
        <Dialog
          title="New Node"
          onClose={() => setIsOpen(false)}
          onAdd={onAdd}
          fields={[
            { name: "label", placeholder: "Node name" },
            { name: "value", placeholder: "Value", type: "number" },
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

// Optimized edges list
export const EdgesList: React.FC = () => {
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const deleteEdge = useAppStore((state) => state.deleteEdge);
  const addEdge = useAppStore((state) => state.addEdge);
  /* refresh */
  useAppStore((state) => state.stateVersion);
  useAppStore((state) => state.selected.workspace);
  useAppStore((state) => state.selected.scenario);
  useAppStore((state) => state.selected.node);
  
  const scenario = getCurrentScenario();
  const edges = scenario?.edges || [];
  const nodes = scenario?.children || [];
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ 
    source: nodes[0]?.id || "", 
    target: nodes[1]?.id || "", 
    label: "" 
  });
  
  const getNodeLabel = (nodeId: string): string => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? node.label : nodeId;
  };
  
  const onAdd = () => {
    if (formData.source && formData.target) {
      addEdge({
        source: formData.source,
        target: formData.target,
        label: formData.label,
        type: "step",
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Edges"
        onAddClick={() => openDialog()}
      />
      <div className="flex-1 overflow-auto">
        <ItemList
          items={edges}
          selected={""}
          onClick={() => {}}
          onDelete={deleteEdge}
          renderItem={(item) => (
            <div className="text-sm flex items-center">
              {getNodeLabel(item.source)}
              <Link className="h-3 w-3 mx-1" />
              {getNodeLabel(item.target)}
              {item.label && (
                <span className="ml-1 text-gray-500">({item.label})</span>
              )}
            </div>
          )}
        />
      </div>

      {isOpen && (
        <Dialog
          title="New Edge"
          onClose={() => setIsOpen(false)}
          onAdd={onAdd}
          fields={[
            {
              name: "source",
              placeholder: "Source node",
              type: "select",
              options: nodes.map((n) => ({ value: n.id, label: n.label })),
            },
            {
              name: "target",
              placeholder: "Target node",
              type: "select",
              options: nodes.map((n) => ({ value: n.id, label: n.label })),
            },
            { name: "label", placeholder: "Edge label (optional)", type: "text-optional" },
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </div>
  );
};