// src/modules/editNode/hooks/useNodeEdit.ts
import { useState, useEffect } from 'react';
import { useEngineStore } from "@/core/hooks/useEngineStore";
import { configDB } from "@/provideDB/indexedDB/config";

interface NodeEditData {
  path: string;
  slug: string;
  label: string;
  order: number;
  tplFile: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export const useNodeEdit = (
  workspace: any,
  scenario: any,
  node: any,
  configName: string
) => {
  const { get, set, reset } = useEngineStore();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const contextKey = `editNode_${workspace.slug}_${scenario.slug}_${node.slug}`;

  useEffect(() => {
    const initialData: NodeEditData = {
      path: `${workspace.name} → ${scenario.name} → ${node.slug}`,
      slug: node.slug,
      label: node.label,
      order: node.order,
      tplFile: node.tplFile
    };

    set(contextKey, initialData);
    
    return () => {
      const currentData = get("data") || {};
      delete currentData[contextKey];
      reset();
      set("data", currentData);
    };
  }, [workspace, scenario, node, contextKey, set, reset, get]);

  const formData = get(contextKey) || {};

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.label?.trim()) {
      newErrors.label = "Label jest wymagany";
    } else if (formData.label.length < 2) {
      newErrors.label = "Label musi mieć co najmniej 2 znaki";
    } else if (formData.label.length > 100) {
      newErrors.label = "Label nie może przekraczać 100 znaków";
    }

    if (!formData.order) {
      newErrors.order = "Kolejność jest wymagana";
    } else if (formData.order < 1) {
      newErrors.order = "Kolejność musi być większa od 0";
    } else if (formData.order > 99) {
      newErrors.order = "Kolejność nie może przekraczać 99";
    }

    if (!formData.tplFile?.trim()) {
      newErrors.tplFile = "Template file jest wymagany";
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

  const saveNode = async (): Promise<boolean> => {
    if (!validateForm()) return false;

    setSaving(true);
    try {
      const configKey = `${configName}:/src/_configs/${configName}/scenarios/${workspace.slug}/${scenario.slug}.json`;
      
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

      await configDB.records.put({
        id: configKey,
        data: updatedConfig,
        updatedAt: new Date(),
      });

      console.log(`✅ Zaktualizowano node ${workspace.slug}/${scenario.slug}/${node.slug}`);
      return true;
    } catch (error) {
      console.error("Błąd podczas zapisywania node:", error);
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
    saveNode,
    validateForm
  };
};