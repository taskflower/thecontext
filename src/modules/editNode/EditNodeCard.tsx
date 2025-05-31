// src/modules/editNode/EditNodeCard.tsx
import React, { useState, useEffect } from "react";
import { TreePine } from "lucide-react";

import { NodeInfo, ScenarioInfo, WorkspaceInfo } from "../appTree/hooks/useAppTree";
import { configDB } from "@/provideDB";
import { useModalState } from "../shared/hooks/useModalState";
import { BaseModal } from "../shared/components/BaseModal";
import { FormField } from "../shared/components/FormField";

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
  const [nodeData, setNodeData] = useState<any>(null);
  const [label, setLabel] = useState<string>(node.label);
  const [order, setOrder] = useState<number>(node.order);
  const [tplFile, setTplFile] = useState<string>(node.tplFile);

  const { loading, saving, error, setError, handleAsync } = useModalState();

  useEffect(() => {
    handleAsync(async () => {
      const configKey = `${configName}:/src/_configs/${configName}/scenarios/${workspace.slug}/${scenario.slug}.json`;
      const cached = await configDB.records.get(configKey);

      if (cached) {
        const data = cached.data;
        setNodeData(data);
        const found = data.nodes.find((n: any) => n.slug === node.slug);
        if (found) {
          setLabel(found.label);
          setOrder(found.order);
          setTplFile(found.tplFile);
        }
      } else {
        try {
          const response = await fetch(
            `/src/_configs/${configName}/scenarios/${workspace.slug}/${scenario.slug}.json`
          );
          if (!response.ok) throw new Error("Nie znaleziono pliku");
          const data = await response.json();
          setNodeData(data);
          await configDB.records.put({ id: configKey, data, updatedAt: new Date() });
          const found = data.nodes.find((n: any) => n.slug === node.slug);
          if (found) {
            setLabel(found.label);
            setOrder(found.order);
            setTplFile(found.tplFile);
          }
        } catch {
          const defaultData = { nodes: scenario.nodes || [] };
          setNodeData(defaultData);
        }
      }
    });
  }, [workspace.slug, scenario.slug, node.slug, scenario.nodes, configName]);

  const handleSave = () =>
    handleAsync(async () => {
      if (!nodeData) return;
      const updatedNodes = (nodeData.nodes || []).map((n: any) =>
        n.slug === node.slug
          ? { ...n, label, order, tplFile }
          : n
      );
      const updatedData = { ...nodeData, nodes: updatedNodes };
      const configKey = `${configName}:/src/_configs/${configName}/scenarios/${workspace.slug}/${scenario.slug}.json`;

      try {
        await configDB.records.put({
          id: configKey,
          data: updatedData,
          updatedAt: new Date(),
        });
        onSave?.({ ...node, label, order, tplFile });
        setTimeout(() => onClose(), 600);
      } catch (e: any) {
        setError(`Błąd podczas zapisywania: ${e.message || e}`);
      }
    }, "save");

  const actions = (
    <div className="flex justify-between items-center">
      <button
        onClick={onClose}
        className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-800"
        disabled={saving}
      >
        Anuluj
      </button>
      <button
        onClick={handleSave}
        disabled={saving}
        className={`px-3 py-1.5 text-xs text-white rounded flex items-center gap-1 ${
          saving ? "bg-zinc-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {saving ? "Zapisywanie..." : "💾 Zapisz"}
      </button>
    </div>
  );

  if (loading)
    return (
      <BaseModal title="Ładowanie..." onClose={onClose} icon={<TreePine size={14} />}>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-zinc-200 rounded w-3/4"></div>
          ))}
        </div>
      </BaseModal>
    );

  return (
    <BaseModal
    position={2} 
      title="Edycja kroku"
      subtitle={`${workspace.name} / ${scenario.name} / ${node.slug}`}
      icon={<TreePine size={14} />}
      onClose={onClose}
      actions={actions}
    >
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-zinc-900">📝 Podstawowe ustawienia</h4>
          <FormField
            label="Slug (niezmienny)"
            type="text"
            value={node.slug}
            onChange={() => {}}
            disabled
          />
          <FormField
            label="Etykieta"
            type="text"
            value={label}
            onChange={setLabel}
            placeholder="Podaj etykietę kroku"
            required
          />
          <FormField
            label="Kolejność"
            type="number"
            value={order}
            onChange={(val) => setOrder(Number(val))}
            placeholder="Numer porządkowy"
            required
          />
          <FormField
            label="Template File"
            type="text"
            value={tplFile}
            onChange={setTplFile}
            placeholder="Np. FormStep, ListTableStep"
            required
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default EditNodeCard;
