// src/modules/editScenario/hooks/useScenarioEdit.ts
import { useState, useEffect } from 'react';
import { useEngineStore } from "@/core/hooks/useEngineStore";
import { configDB } from "@/provideDB/indexedDB/config";

interface ScenarioEditData {
  workspaceName: string;
  slug: string;
  name: string;
  nodeCount: number;
}

interface ValidationErrors {
  [key: string]: string;
}

export const useScenarioEdit = (
  workspace: any,
  scenario: any,
  configName: string
) => {
  const { get, set, reset } = useEngineStore();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const contextKey = `editScenario_${workspace.slug}_${scenario.slug}`;

  useEffect(() => {
    const initialData: ScenarioEditData = {
      workspaceName: workspace.name,
      slug: scenario.slug,
      name: scenario.name,
      nodeCount: scenario.nodes?.length || 0
    };

    set(contextKey, initialData);
    
    return () => {
      const currentData = get("data") || {};
      delete currentData[contextKey];
      reset();
      set("data", currentData);
    };
  }, [workspace, scenario, contextKey, set, reset, get]);

  const formData = get(contextKey) || {};

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Nazwa jest wymagana";
    } else if (formData.name.length < 2) {
      newErrors.name = "Nazwa musi mieć co najmniej 2 znaki";
    } else if (formData.name.length > 50) {
      newErrors.name = "Nazwa nie może przekraczać 50 znaków";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (key: string, value: any) => {
    set(contextKey, { ...formData, [key]: value });
    
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const saveScenario = async (): Promise<boolean> => {
    if (!validateForm()) return false;

    setSaving(true);
    try {
      const configKey = `${configName}:/src/_configs/${configName}/scenarios/${workspace.slug}/${scenario.slug}.json`;
      
      const currentConfig = await configDB.records.get(configKey);
      
      if (!currentConfig) {
        throw new Error("Nie znaleziono konfiguracji scenariusza");
      }

      // Update scenario name and first node label
      const updatedConfig = {
        ...currentConfig.data,
        name: formData.name,
        nodes: currentConfig.data.nodes?.map((node: any, index: number) => 
          index === 0 
            ? { ...node, label: formData.name }
            : node
        ) || [],
      };

      await configDB.records.put({
        id: configKey,
        data: updatedConfig,
        updatedAt: new Date(),
      });

      console.log(`✅ Zaktualizowano scenariusz ${workspace.slug}/${scenario.slug}`);
      return true;
    } catch (error) {
      console.error("Błąd podczas zapisywania scenariusza:", error);
      setErrors({ submit: `Błąd podczas zapisywania: ${error}` });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    errors,
    saving,
    updateField,
    saveScenario,
    validateForm
  };
};