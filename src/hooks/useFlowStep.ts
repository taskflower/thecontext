// src/hooks/useFlowStep.ts
import { useState, useEffect, useRef, useCallback } from 'react';
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

  // Referencje dla LLM
  const autoStartExecutedRef = useRef(false);
  const isMountedRef = useRef(true);
  
  // Stan dla części LLM
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);

  // Pobieranie danych kontekstowych
  const { 
    processTemplate, 
    getContextPath, 
    updateContextPath 
  } = useAppStore();
  
  const { getToken, user } = useAuth();

  // Przetworzony tekst asystenta
  const processedAssistantMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';

  // Ustaw referencję zamontowania i resetuj stan autostartu przy zmianie node
  useEffect(() => {
    console.log(`[useFlowStep] Node changed to: ${node.id} (${node.template})`);
    isMountedRef.current = true;
    // Resetuj flagę autostartu przy zmianie node
    autoStartExecutedRef.current = false;
    
    return () => {
      console.log(`[useFlowStep] Unmounting node: ${node.id}`);
      isMountedRef.current = false;
    };
  }, [node.id, node.template]);

  // Pobieranie pól formularza ze schematu
  useEffect(() => {
    const attrs = node.attrs || {};
    if (!attrs.schemaPath) {
      setFormFields([]);
      return;
    }

    try {
      console.log("[useFlowStep] Loading schema from path:", attrs.schemaPath);
      
      // Pobierz schemat z kontekstu
      const schemaPath = attrs.schemaPath; // np. "schemas.form.business"
      const pathParts = schemaPath.split('.');
      
      // Pobierz cały kontekst
      const currentWorkspaceId = useAppStore.getState().data.currentWorkspaceId;
      const context = useAppStore.getState().data.contexts[currentWorkspaceId || ''] || {};
      
      console.log("[useFlowStep] Current context:", context);
      
      // Nawiguj do schematu
      let schemaData = context;
      for (const part of pathParts) {
        if (!schemaData || typeof schemaData !== 'object') {
          console.warn(`[useFlowStep] Invalid path segment: ${part} in ${schemaPath}`);
          schemaData = null;
          break;
        }
        schemaData = schemaData[part];
      }
      
      console.log("[useFlowStep] Schema data found:", schemaData);
      
      if (!schemaData) {
        console.warn(`[useFlowStep] Schema not found at path: ${attrs.schemaPath}`);
        setFormFields([]);
        return;
      }

      // Jeśli dane są już tablicą pól formularza, użyj ich bezpośrednio
      if (Array.isArray(schemaData)) {
        console.log("[useFlowStep] Setting form fields directly:", schemaData);
        setFormFields(schemaData);
        return;
      }
      
      // W przeciwnym razie szukaj w kluczu bazowym (ostatnia część ścieżki)
      const baseKey = pathParts[pathParts.length - 1];
      
      // Jeśli mamy schemas.form.business, wystarczy nam "business"
      if (typeof schemaData === 'object' && !Array.isArray(schemaData)) {
        console.log(`[useFlowStep] Looking for fields in schema key: ${baseKey}`);
        const fields = schemaData; // Tutaj schemaData to już właściwy schemat formularza
        
        if (Array.isArray(fields)) {
          console.log("[useFlowStep] Setting form fields from object key:", fields);
          setFormFields(fields);
          return;
        }
      }
      
      console.warn(`[useFlowStep] Could not find form fields in schema at ${attrs.schemaPath}`);
      setFormFields([]);
    } catch (err) {
      console.error(`[useFlowStep] Error processing form schema:`, err);
      setFormFields([]);
    }
  }, [node.attrs]);

  // Pobieranie schematu dla LLM
  useEffect(() => {
    if (node.attrs?.schemaPath) {
      try {
        console.log(`[useFlowStep:LLM] Getting schema from path: ${node.attrs.schemaPath}`);
        const schemaData = getContextPath(node.attrs.schemaPath);
        if (schemaData) {
          console.log(`[useFlowStep:LLM] Schema found:`, schemaData);
          setSchema(schemaData);
        } else {
          console.warn(`[useFlowStep:LLM] Schema not found at path: ${node.attrs.schemaPath}`);
        }
      } catch (err) {
        console.error('[useFlowStep:LLM] Error getting schema:', err);
        setError(`Error getting schema: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [node.attrs?.schemaPath, getContextPath]);

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

  // Wysłanie wiadomości do LLM
  const sendMessage = useCallback(async (message: string) => {
    try {
      if (!message.trim()) {
        console.warn("[useFlowStep:LLM] Empty message, skipping API call");
        return null;
      }

      console.log(`[useFlowStep:LLM] Sending message: ${message.substring(0, 100)}...`);
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("Authorization token unavailable. Please login again.");
      }

      if (!user) {
        throw new Error("User not logged in. Please login again.");
      }

      // Przygotuj wiadomości
      const messages = [];

      // Dodaj wiadomość systemową jeśli wymagana
      if (node.attrs?.systemMessage) {
        console.log(`[useFlowStep:LLM] Adding system message`);
        messages.push({
          role: 'system',
          content: node.attrs.systemMessage,
        });
      }

      // Dodaj wiadomość inicjalizacyjną i odpowiedź asystenta jeśli istnieją
      if (node.attrs?.initialUserMessage) {
        const initialMessage = processTemplate(node.attrs.initialUserMessage);
        console.log(`[useFlowStep:LLM] Processing initial message: ${initialMessage.substring(0, 100)}...`);
        
        let initialContent = initialMessage;
        if (schema && !initialContent.includes('```json')) {
          console.log(`[useFlowStep:LLM] Adding schema to initial message`);
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
        console.log(`[useFlowStep:LLM] Adding schema to user message`);
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

      console.log("[useFlowStep:LLM] Payload prepared:", { 
        messagesCount: messages.length, 
        firstMessagePreview: messages[0]?.content.substring(0, 50) + '...'
      });
      
      // Ustaw informacje debugowania
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`;
      setDebugInfo(`Sending to: ${apiUrl}`);

      // Wywołaj API
      console.log(`[useFlowStep:LLM] Sending request to API: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Sprawdź czy komponent jest nadal zamontowany
      if (!isMountedRef.current) {
        console.log("[useFlowStep:LLM] Component unmounted, aborting response processing");
        return null;
      }

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
      console.log("[useFlowStep:LLM] API response received:", apiResponseData);
      
      const content = apiResponseData?.success && apiResponseData?.data?.message?.content;
      
      if (!content) {
        throw new Error('Invalid API response format');
      }
      
      const data = extractJsonFromContent(content);
      console.log("[useFlowStep:LLM] Extracted data from response:", data);
      
      if (isMountedRef.current) {
        setResponseData(data);

        // Zapisz dane do kontekstu jeśli podano contextPath
        if (node.contextPath && data) {
          console.log(`[useFlowStep:LLM] Saving data to context path: ${node.contextPath}`);
          updateContextPath(node.contextPath, data);
        }
      }
      
      return data;
    } catch (err) {
      console.error('[useFlowStep:LLM] API error:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : String(err));
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    getToken,
    user,
    node.attrs?.systemMessage,
    node.attrs?.initialUserMessage,
    node.contextPath,
    processTemplate,
    processedAssistantMessage,
    schema,
    updateContextPath
  ]);

  // Obsługa autostartu dla LLM
  useEffect(() => {
    const handleAutoStart = async () => {
      if (
        node.template === 'llm-step' && 
        node.attrs?.autoStart && 
        !autoStartExecutedRef.current && 
        !isLoading && 
        !responseData && 
        !error
      ) {
        console.log(`[useFlowStep:LLM] Auto-starting LLM for node: ${node.id}`);
        // Ustaw flagę przed wysłaniem, aby uniknąć duplikacji wywołań
        autoStartExecutedRef.current = true;
        
        const initialMessage = node.attrs?.initialUserMessage || '';
        if (initialMessage) {
          console.log(`[useFlowStep:LLM] Using initial message for autostart: ${initialMessage.substring(0, 50)}...`);
          const processedMessage = processTemplate(initialMessage);
          await sendMessage(processedMessage);
        }
      }
    };

    // Uruchom autostart z małym opóźnieniem dla stabilności
    const timer = setTimeout(() => {
      handleAutoStart();
    }, 200);

    return () => clearTimeout(timer);
  }, [
    node.template,
    node.attrs?.autoStart,
    node.attrs?.initialUserMessage,
    node.id,
    isLoading,
    responseData,
    error,
    processTemplate,
    sendMessage
  ]);

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
    schema,
    debugInfo
  };
}