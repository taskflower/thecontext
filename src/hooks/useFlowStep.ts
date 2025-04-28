// src/hooks/useFlowStep.ts
import { useState, useEffect } from 'react';
import { NodeData, FormField } from '@/types';
import { extractJsonFromContent } from '@/utils/apiUtils';
import { useAuth } from './useAuth';
import { useAppStore } from '@/useAppStore';

/**
 * Zunifikowany hook do obsługi kroków flow - łączy funkcjonalności z:
 * - useFlowStep
 * - useFormInput
 * - useLLM
 * w jeden spójny interfejs
 */
export function useFlowStep({ 
  node, 
  onSubmit, 
  onPrevious, 
  isFirstNode, 
  isLastNode 
}: {
  node: NodeData;
  onSubmit: (data: any) => void;
  onPrevious: () => void;
  isFirstNode: boolean;
  isLastNode: boolean;
}) {
  // Obsługa nawigacji
  const handlePrevious = () => {
    if (isFirstNode) {
      onPrevious();
    } else {
      onPrevious();
    }
  };

  const handleComplete = (data: any) => {
    onSubmit(data);
  };

  // Część dla formularzy
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // Pobieranie danych kontekstowych
  const { 
    processTemplate, 
    getContextPath, 
    updateContextPath 
  } = useAppStore();

  // Przetworzony tekst asystenta
  const processedAssistantMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';

  // Pobieranie pól formularza ze schematu
  useEffect(() => {
    const attrs = node.attrs || {};
    if (!attrs.schemaPath) {
      setFormFields([]);
      return;
    }

    try {
      console.log("Loading schema from path:", attrs.schemaPath);
      
      // Pobierz schemat z kontekstu
      const schemaPath = attrs.schemaPath; // np. "schemas.form.business"
      const pathParts = schemaPath.split('.');
      
      // Pobierz cały kontekst
      const currentWorkspaceId = useAppStore.getState().data.currentWorkspaceId;
      const context = useAppStore.getState().data.contexts[currentWorkspaceId || ''] || {};
      
      console.log("Current context:", context);
      
      // Nawiguj do schematu
      let schemaData = context;
      for (const part of pathParts) {
        if (!schemaData || typeof schemaData !== 'object') {
          console.warn(`Invalid path segment: ${part} in ${schemaPath}`);
          schemaData = null;
          break;
        }
        schemaData = schemaData[part];
      }
      
      console.log("Schema data found:", schemaData);
      
      if (!schemaData) {
        console.warn(`Schema not found at path: ${attrs.schemaPath}`);
        setFormFields([]);
        return;
      }

      // Jeśli dane są już tablicą pól formularza, użyj ich bezpośrednio
      if (Array.isArray(schemaData)) {
        console.log("Setting form fields directly:", schemaData);
        setFormFields(schemaData);
        return;
      }
      
      // W przeciwnym razie szukaj w kluczu bazowym (ostatnia część ścieżki)
      const baseKey = pathParts[pathParts.length - 1];
      
      // Jeśli mamy schemas.form.business, wystarczy nam "business"
      if (typeof schemaData === 'object' && !Array.isArray(schemaData)) {
        console.log(`Looking for fields in schema key: ${baseKey}`);
        const fields = schemaData; // Tutaj schemaData to już właściwy schemat formularza
        
        if (Array.isArray(fields)) {
          console.log("Setting form fields from object key:", fields);
          setFormFields(fields);
          return;
        }
      }
      
      console.warn(`Could not find form fields in schema at ${attrs.schemaPath}`);
      setFormFields([]);
    } catch (err) {
      console.error(`Error processing form schema:`, err);
      setFormFields([]);
    }
  }, [node.attrs]);

  // Obsługa zmian w formularzu
  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Sprawdzenie czy wymagane pola są wypełnione
  const areRequiredFieldsFilled = () => {
    return formFields.every(
      field => !field.required || 
      (formData[field.name] !== undefined && formData[field.name] !== '')
    );
  };
  
  // Obsługa potwierdzenia formularza
  const handleSubmit = (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (node.contextPath) {
      const basePath = node.contextPath;
      Object.entries(formData).forEach(([key, value]) => {
        updateContextPath(`${basePath}.${key}`, value);
      });
    }
    
    handleComplete(formData);
    return formData;
  };

  // Część dla LLM
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [schema, setSchema] = useState<any>(null);

  const { getToken, user } = useAuth();

  // Pobieranie schematu dla LLM
  useEffect(() => {
    if (node.attrs?.schemaPath) {
      try {
        const schemaData = getContextPath(node.attrs.schemaPath);
        if (schemaData) {
          setSchema(schemaData);
        }
      } catch (err) {
        console.error('Error getting schema:', err);
        setError(`Error getting schema: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [node.attrs?.schemaPath, getContextPath]);

  // Wysłanie wiadomości do LLM
  const sendMessage = async (message: string) => {
    try {
      if (!message.trim()) {
        console.warn('Empty message, skipping API call');
        return;
      }

      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Authorization token unavailable. Please login again.');
      }

      if (!user) {
        throw new Error('User not logged in. Please login again.');
      }

      // Przygotuj wiadomości
      const messages = [];

      // Dodaj wiadomość systemową jeśli wymagana
      if (node.attrs?.systemMessage) {
        messages.push({
          role: 'system',
          content: node.attrs.systemMessage,
        });
      }

      // Dodaj wiadomość inicjalizacyjną i odpowiedź asystenta jeśli istnieją
      if (node.attrs?.initialUserMessage) {
        const initialMessage = processTemplate(node.attrs.initialUserMessage);
        
        let initialContent = initialMessage;
        if (schema && !initialContent.includes('```json')) {
          initialContent += `\n\nUse the following JSON schema:\n\`\`\`json\n${JSON.stringify(
            schema,
            null,
            2
          )}\n\`\`\``;
        }

        messages.push({
          role: 'user',
          content: initialContent,
        });

        if (processedAssistantMessage && processedAssistantMessage.trim() !== '') {
          messages.push({
            role: 'assistant',
            content: processedAssistantMessage,
          });
        }
      }

      // Dodaj aktualną wiadomość użytkownika
      let userContent = message;
      if (schema && !userContent.includes('```json')) {
        userContent += `\n\nUse the following JSON schema:\n\`\`\`json\n${JSON.stringify(
          schema,
          null,
          2
        )}\n\`\`\``;
      }

      messages.push({
        role: 'user',
        content: userContent,
      });

      // Przygotuj payload do API
      const payload = {
        messages: messages,
        userId: user.uid,
      };

      // Wywołaj API
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      // Obsłuż błędy API
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
        } catch {
          throw new Error(`API request failed: ${response.status} - ${errorText.substring(0, 100)}...`);
        }
      }

      // Przetwórz odpowiedź
      const apiResponseData = await response.json();
      const content = apiResponseData?.success && apiResponseData?.data?.message?.content;
      
      if (!content) {
        throw new Error('Invalid API response format');
      }
      
      const data = extractJsonFromContent(content);
      setResponseData(data);

      // Zapisz dane do kontekstu jeśli podano contextPath
      if (node.contextPath && data) {
        updateContextPath(node.contextPath, data);
      }
      
      return data;
    } catch (err) {
      console.error('LLM API error:', err);
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Autostart dla LLM jeśli potrzebny
  useEffect(() => {
    if (node.template === 'llm-step' && node.attrs?.autoStart && !isLoading && !responseData && !error) {
      const initialMessage = node.attrs?.initialUserMessage || '';
      if (initialMessage) {
        const processedMessage = processTemplate(initialMessage);
        sendMessage(processedMessage);
      }
    }
  }, [node.template, node.attrs?.autoStart, node.attrs?.initialUserMessage, isLoading, responseData, error, processTemplate]);

  return {
    // Właściwości wspólne
    isLoading,
    error,
    processedAssistantMessage,
    handlePrevious,
    handleComplete,
    
    // Właściwości formularza
    formData,
    formFields,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
    
    // Właściwości LLM
    responseData,
    sendMessage,
    schema
  };
}