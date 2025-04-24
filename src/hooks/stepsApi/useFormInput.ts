// src/hooks/useFormInput.ts
import { useState, useEffect } from "react";
import { FormField } from "@/types";
import { useContextStore, useWorkspaceStore } from "..";


interface FormInputAttrs {
  schemaPath?: string; // np. 'schemas.form.website'
}

interface UseFormInputProps {
  node: {
    attrs?: FormInputAttrs;
    assistantMessage?: string;
    contextPath?: string;
  };
}

export function useFormInput({ node }: UseFormInputProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const processTemplate = useContextStore((s) => s.processTemplate);
  const updateByContextPath = useContextStore((s) => s.updateByContextPath);
  const currWrkspId = useWorkspaceStore((s) => s.currentWorkspaceId);

  const contextSchemas = useContextStore(
    (state) => state.contexts[currWrkspId || ""]?.schemas?.form
  );

  const attrs = node.attrs || {};
  const processedAssistantMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : "";

  useEffect(() => {
    if (!contextSchemas || !attrs.schemaPath) {
      setFormFields([]);
      return;
    }
    const key = attrs.schemaPath.replace(/^schemas\.form\./, "");
    const fields = (contextSchemas as Record<string, FormField[]>)[key];
    if (Array.isArray(fields)) {
      setFormFields(fields);
    } else {
      console.warn("useFormInput: brak schematu dla", attrs.schemaPath);
      setFormFields([]);
    }
  }, [contextSchemas, attrs.schemaPath]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e?: React.FormEvent | any) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (node.contextPath) {
      const basePath = node.contextPath;
      Object.entries(formData).forEach(([key, value]) => {
        updateByContextPath(`${basePath}.${key}`, value);
      });
    }
    return formData;
  };

  const areRequiredFieldsFilled = () =>
    formFields.every(
      (f) =>
        !f.required ||
        (formData[f.name] !== undefined && formData[f.name] !== "")
    );

  return {
    formData,
    formFields,
    processedAssistantMessage,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
  };
}
