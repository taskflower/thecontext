// src/modules/editScenario/EditScenarioCard.tsx
import React, { useState, useEffect } from "react";
import { TreePine } from "lucide-react";

import { ScenarioInfo, WorkspaceInfo } from "../appTree/hooks/useAppTree";
import { configDB } from "@/provideDB";
import { useModalState } from "../shared/hooks/useModalState";
import { BaseModal } from "../shared/components/BaseModal";
import { FormField } from "../shared/components/FormField";

interface EditScenarioCardProps {
  workspace: WorkspaceInfo;
  scenario: ScenarioInfo;
  configName: string;
  onClose: () => void;
  onSave?: (updatedScenario: ScenarioInfo) => void;
}

const EditScenarioCard: React.FC<EditScenarioCardProps> = ({
  workspace,
  scenario,
  configName,
  onClose,
  onSave,
}) => {
  const [scenarioData, setScenarioData] = useState<any>(null);
  const [name, setName] = useState<string>(scenario.name);
  const [slug, setSlug] = useState<string>(scenario.slug);
  const [nodeCount, setNodeCount] = useState<number>(scenario.nodes?.length || 0);

  const { loading, saving, error, setError, handleAsync } = useModalState();

  // Wczytanie istniejącej konfiguracji scenariusza z IndexedDB lub z pliku
  useEffect(() => {
    handleAsync(async () => {
      const configKey = `${configName}:/src/_configs/${configName}/scenarios/${workspace.slug}/${scenario.slug}.json`;
      const cached = await configDB.records.get(configKey);

      if (cached) {
        const data = cached.data;
        setScenarioData(data);
        setName(data.name || scenario.name);
        setNodeCount(data.nodes?.length || 0);
      } else {
        try {
          const response = await fetch(
            `/src/_configs/${configName}/scenarios/${workspace.slug}/${scenario.slug}.json`
          );
          if (!response.ok) throw new Error("Nie znaleziono pliku");
          const data = await response.json();
          setScenarioData(data);
          setName(data.name || scenario.name);
          setNodeCount(data.nodes?.length || 0);
          await configDB.records.put({
            id: configKey,
            data,
            updatedAt: new Date(),
          });
        } catch {
          // Jeśli nie ma pliku, użyj domyślnych wartości
          const defaultData = {
            slug: scenario.slug,
            name: scenario.name,
            nodes: scenario.nodes || [],
          };
          setScenarioData(defaultData);
          setName(defaultData.name);
          setNodeCount(defaultData.nodes.length);
        }
      }
    });
  }, [workspace.slug, scenario.slug, scenario.name, scenario.nodes, configName]);

  // Zapisanie zaktualizowanej konfiguracji
  const handleSave = () =>
    handleAsync(async () => {
      if (!scenarioData) return;
      const updatedData = {
        ...scenarioData,
        name,
        nodes: (scenarioData.nodes || []).map((node: any, index: number) =>
          index === 0 ? { ...node, label: name } : node
        ),
      };

      const configKey = `${configName}:/src/_configs/${configName}/scenarios/${workspace.slug}/${scenario.slug}.json`;
      try {
        await configDB.records.put({
          id: configKey,
          data: updatedData,
          updatedAt: new Date(),
        });
        setScenarioData(updatedData);
        setNodeCount(updatedData.nodes.length);
        onSave?.({ ...scenario, name });
        // Krótka animacja i zamknięcie
        setTimeout(() => onClose(), 600);
      } catch (e: any) {
        setError(`Błąd podczas zapisywania: ${e.message || e}`);
      }
    }, "save");

  // Akcje przycisków: Anuluj i Zapisz
  const actions = (
    <div className="flex justify-between items-center">
      <button
        onClick={onClose}
        className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-800"
        disabled={saving}
      >
        Anuluj
      </button>
      <div className="flex gap-2">
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
      title="Edycja scenariusza"
      subtitle={`${workspace.name} / ${slug}`}
      icon={<TreePine size={14} />}
      onClose={onClose}
      actions={actions}
      position={2}
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
            value={slug}
            onChange={() => {}}
            disabled
          />
          <FormField
            label="Nazwa scenariusza"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Podaj nazwę scenariusza"
          />
          <FormField
            label="Liczba kroków"
            type="number"
            value={nodeCount}
            onChange={() => {}}
            disabled
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default EditScenarioCard;
