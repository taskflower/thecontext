// src/modules/appTree/components/EditNodeCard.tsx
import React, { useState } from "react";

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
}

interface EditNodeCardProps {
  workspace: WorkspaceInfo;
  scenario: ScenarioInfo;
  node: NodeInfo;
  onClose: () => void;
}

const EditNodeCard: React.FC<EditNodeCardProps> = ({
  workspace,
  scenario,
  node,
  onClose,
}) => {
  const [label, setLabel] = useState(node.label);
  const [order, setOrder] = useState(node.order);
  const [tplFile, setTplFile] = useState(node.tplFile);

  const handleSave = () => {
    // TODO: Zaimplementować zapis zmian (np. call API lub aktualizacja pliku JSON)
    console.log(
      "Zapisuję node:",
      workspace.slug,
      "/",
      scenario.slug,
      "/",
      node.slug,
      "Nowy label:",
      label,
      "Nowy order:",
      order,
      "Nowy tplFile:",
      tplFile
    );
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-50"
        onClick={onClose}
      />
      {/* Card */}
      <div className="fixed left-1/4 top-1/6 z-60 w-4/12 bg-white rounded-lg shadow-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edycja kroku</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100"
          >
            ✖
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Slug
            </label>
            <input
              type="text"
              value={node.slug}
              disabled
              className="mt-1 block w-full border border-zinc-300 rounded-md p-2 bg-zinc-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 block w-full border border-zinc-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Kolejność (order)
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="mt-1 block w-full border border-zinc-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              tplFile
            </label>
            <input
              type="text"
              value={tplFile}
              onChange={(e) => setTplFile(e.target.value)}
              className="mt-1 block w-full border border-zinc-300 rounded-md p-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200"
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Zapisz
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditNodeCard;
