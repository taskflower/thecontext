/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ChangeEvent } from "react";
import { PlusCircle, X, Trash2, Link } from "lucide-react";
import { useAppStore } from "./store";
import {
  SectionHeaderProps,
  CardPanelProps,
  DialogProps,
  ItemListProps,
  StepModalProps,
} from "./types";

// Reusable UI Components
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onAddClick,
}) => (
  <div className="flex items-center justify-between mb-2">
    <div className="text-sm font-medium">{title}</div>
    <button
      className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
      onClick={onAddClick}
    >
      <PlusCircle className="h-4 w-4" />
    </button>
  </div>
);

export const EmptyState: React.FC = () => (
  <div className="px-2 py-4 text-center text-xs text-gray-500">
    Brak elementów
  </div>
);

export const CardPanel: React.FC<CardPanelProps> = ({
  title,
  children,
  onAddClick,
}) => (
  <div className="bg-white rounded-md shadow-sm mb-3">
    <div className="p-3">
      <SectionHeader title={title} onAddClick={onAddClick} />
      {children}
    </div>
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
            className="py-1 px-2 text-xs rounded-md font-medium bg-blue-500 text-white hover:bg-blue-600"
          >
            Dodaj
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

// Item List Component
export function ItemList<T extends { id: string }>({
  items,
  selected,
  onClick,
  onDelete,
  renderItem,
}: ItemListProps<T>) {
  return (
    <div className="overflow-auto h-[180px]">
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center px-2 py-1.5 rounded-sm text-xs cursor-pointer ${
              item.id === selected
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <div className="flex-1 truncate" onClick={() => onClick(item.id)}>
              {renderItem(item)}
            </div>
            <button
              className="p-1 opacity-70 hover:opacity-100 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
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

// Generyczny komponent do obsługi paneli listy
interface ListPanelConfig<T extends Record<string, any>> {
  title: string;
  emptyFormData: T;
  dialogTitle: string;
  fields: Array<{
    name: string;
    placeholder: string;
    type?: string;
    options?: Array<{ value: string; label: string }>;
  }>;
  getItems: () => Array<any>;
  getSelected: () => string;
  handleSelect: (id: string) => void;
  handleDelete: (id: string) => void;
  handleAdd: (data: T) => void;
  renderItem: (item: any) => React.ReactNode;
}

export function GenericListPanel<T extends Record<string, any>>({
  title,
  emptyFormData,
  dialogTitle,
  fields,
  getItems,
  getSelected,
  handleSelect,
  handleDelete,
  handleAdd,
  renderItem,
}: ListPanelConfig<T>) {
  const { isOpen, formData, openDialog, handleChange, setIsOpen } =
    useDialogState<T>(emptyFormData);
  
  const items = getItems();
  const selected = getSelected();

  const onAdd = () => {
    // Sprawdź, czy wszystkie wymagane pola są wypełnione
    const requiredFieldsFilled = Object.entries(formData).every(
      ([key, value]) => !fields.find(f => f.name === key)?.type?.includes('optional') ? !!value : true
    );
    
    if (requiredFieldsFilled) {
      handleAdd(formData);
      setIsOpen(false);
    }
  };

  return (
    <>
      <CardPanel
        title={title}
        onAddClick={() => openDialog()}
      >
        <ItemList
          items={items}
          selected={selected}
          onClick={handleSelect}
          onDelete={handleDelete}
          renderItem={renderItem}
        />
      </CardPanel>

      {isOpen && (
        <Dialog
          title={dialogTitle}
          onClose={() => setIsOpen(false)}
          onAdd={onAdd}
          fields={fields}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </>
  );
}

// Business Components using Generic List Panel
export const WorkspacesList: React.FC = () => {
  const items = useAppStore((state) => state.items);
  const selected = useAppStore((state) => state.selected);
  const selectWorkspace = useAppStore((state) => state.selectWorkspace);
  const deleteWorkspace = useAppStore((state) => state.deleteWorkspace);
  const addWorkspace = useAppStore((state) => state.addWorkspace);
  const stateVersion = useAppStore((state) => state.stateVersion);

  return (
    <GenericListPanel
      title="Workspaces"
      emptyFormData={{ title: "" }}
      dialogTitle="Nowy Workspace"
      fields={[{ name: "title", placeholder: "Workspace name" }]}
      getItems={() => items}
      getSelected={() => selected.workspace}
      handleSelect={selectWorkspace}
      handleDelete={deleteWorkspace}
      handleAdd={addWorkspace}
      renderItem={(item) => <div className="font-medium">{item.title}</div>}
    />
  );
};

export const ScenariosList: React.FC = () => {
  const items = useAppStore((state) => state.items);
  const selected = useAppStore((state) => state.selected);
  const selectScenario = useAppStore((state) => state.selectScenario);
  const deleteScenario = useAppStore((state) => state.deleteScenario);
  const addScenario = useAppStore((state) => state.addScenario);
  const stateVersion = useAppStore((state) => state.stateVersion);

  const workspace = items.find((w) => w.id === selected.workspace);
  const scenarios = workspace?.children || [];

  return (
    <GenericListPanel
      title="Scenarios"
      emptyFormData={{ name: "", description: "" }}
      dialogTitle="Nowy Scenario"
      fields={[
        { name: "name", placeholder: "Scenario name" },
        { name: "description", placeholder: "Description" },
      ]}
      getItems={() => scenarios}
      getSelected={() => selected.scenario}
      handleSelect={selectScenario}
      handleDelete={deleteScenario}
      handleAdd={addScenario}
      renderItem={(item) => (
        <>
          <div className="font-medium">{item.name}</div>
          {item.description && (
            <div className="text-xs opacity-70 truncate">
              {item.description}
            </div>
          )}
        </>
      )}
    />
  );
};

export const NodesList: React.FC = () => {
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const selected = useAppStore((state) => state.selected);
  const selectNode = useAppStore((state) => state.selectNode);
  const deleteNode = useAppStore((state) => state.deleteNode);
  const addNode = useAppStore((state) => state.addNode);
  const stateVersion = useAppStore((state) => state.stateVersion);

  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];

  return (
    <GenericListPanel
      title="Nodes"
      emptyFormData={{ label: "", value: "" }}
      dialogTitle="Nowy Node"
      fields={[
        { name: "label", placeholder: "Node name" },
        { name: "value", placeholder: "Value", type: "number" },
      ]}
      getItems={() => nodes}
      getSelected={() => selected.node}
      handleSelect={selectNode}
      handleDelete={deleteNode}
      handleAdd={addNode}
      renderItem={(item) => (
        <div className="flex items-center">
          <div className="font-medium">{item.label}</div>
          <span className="ml-auto inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 text-[10px] h-4">
            {item.value}
          </span>
        </div>
      )}
    />
  );
};

export const EdgesList: React.FC = () => {
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const deleteEdge = useAppStore((state) => state.deleteEdge);
  const addEdge = useAppStore((state) => state.addEdge);
  const stateVersion = useAppStore((state) => state.stateVersion);

  const scenario = getCurrentScenario();
  const edges = scenario?.edges || [];
  const nodes = scenario?.children || [];

  const getNodeLabel = (nodeId: string): string => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? node.label : nodeId;
  };

  return (
    <GenericListPanel
      title="Edges"
      emptyFormData={{ 
        source: nodes[0]?.id || "", 
        target: nodes[1]?.id || "", 
        label: "" 
      }}
      dialogTitle="New Edge"
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
      getItems={() => edges}
      getSelected={() => ""}
      handleSelect={() => {}}
      handleDelete={deleteEdge}
      handleAdd={(data) => 
        addEdge({
          source: data.source,
          target: data.target,
          label: data.label,
          type: "step",
        })
      }
      renderItem={(item) => (
        <div className="font-medium flex items-center">
          {getNodeLabel(item.source)}
          <Link className="h-3 w-3 mx-1" />
          {getNodeLabel(item.target)}
          {item.label && (
            <span className="ml-1 text-gray-500">({item.label})</span>
          )}
        </div>
      )}
    />
  );
};