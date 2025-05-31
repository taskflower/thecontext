// src/modules/appTree/components/EditWorkspaceCard.tsx
import React, { useState } from "react";

interface WorkspaceInfo {
  slug: string;
  name: string;
  scenarios: any[];
}

interface EditWorkspaceCardProps {
  workspace: WorkspaceInfo;
  onClose: () => void;
}

const EditWorkspaceCard: React.FC<EditWorkspaceCardProps> = ({
  workspace,
  onClose,
}) => {
  const [name, setName] = useState(workspace.name);

  const handleSave = () => {
    // TODO: Zaimplementować zapis zmian (np. call API lub aktualizacja pliku JSON)
    console.log("Zapisuję workspace:", workspace.slug, "Nowa nazwa:", name);
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
          <h3 className="text-lg font-semibold">Edycja workspace</h3>
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
              value={workspace.slug}
              disabled
              className="mt-1 block w-full border border-zinc-300 rounded-md p-2 bg-zinc-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Nazwa
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

export default EditWorkspaceCard;
