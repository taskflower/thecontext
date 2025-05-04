// src/hooks/useFlow.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NodeData, FormField } from "@/types";
import { extractJsonFromContent, handleApiError } from "@/utils";
import { useAppStore, useAuth } from "@/hooks";

interface UseFlowProps {
  node?: NodeData;
  onSubmit?: (data: any) => void;
  onPrevious?: () => void;
  isFirstNode?: boolean;
  isLastNode?: boolean;
}

export function useFlow({
  node,
  onSubmit,
  onPrevious,
  isFirstNode,
  isLastNode,
}: UseFlowProps = {}) {
  // Hooki i stan
  const navigate = useNavigate();
  const params = useParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);
  
  // Referencje
  const lastNavigationTimeRef = useRef(0);
  const isMountedRef = useRef(true);
  const autoStartExecutedRef = useRef(false);

  // Hooki autoryzacji i store
  const { getToken, user } = useAuth();
  const {
    selectApplication,
    selectWorkspace,
    selectScenario,
    getCurrentScenario,
    getCurrentWorkspace,
    getContextPath,
    updateContextPath,
    processTemplate,
  } = useAppStore();

  // Bieżące dane
  const currentScenario = getCurrentScenario();
  const currentWorkspace = getCurrentWorkspace();

  // Nody i bieżący node
  const nodes = useMemo(() => {
    if (!currentScenario?.nodes) return [];
    return [...currentScenario.nodes].sort((a, b) => 
      (a.order ?? Infinity) - (b.order ?? Infinity)
    );
  }, [currentScenario]);

  const currentNode = node || nodes[currentStepIndex];
  const isFirst = isFirstNode ?? currentStepIndex === 0;
  const isLast = isLastNode ?? currentStepIndex === nodes.length - 1;
  const processedAssistantMessage = currentNode?.assistantMessage
    ? processTemplate(currentNode.assistantMessage)
    : "";

  // Setup i cleanup
  useEffect(() => {
    isMountedRef.current = true;
    autoStartExecutedRef.current = false;
    return () => { isMountedRef.current = false; };
  }, [currentNode?.id, currentNode?.tplFile]);

  // Ładowanie pól formularza i schematu
  useEffect(() => {
    if (!currentNode?.attrs?.schemaPath) {
      setFormFields([]);
      return;
    }

    try {
      const schemaData = getContextPath(currentNode.attrs.schemaPath);
      setFormFields(Array.isArray(schemaData) ? schemaData : []);
      setSchema(schemaData);
    } catch (err) {
      setFormFields([]);
      setError(`Błąd pobierania schematu: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [currentNode?.attrs?.schemaPath, getContextPath]);

  // Funkcje nawigacji
  const navigateToHome = useCallback(() => navigate("/"), [navigate]);
  
  const navigateToApplications = useCallback(() => {
    if (params.application) {
      selectApplication(params.application);
      navigate(`/app/${params.application}`);
    } else {
      navigateToHome();
    }
  }, [params.application, navigate, navigateToHome, selectApplication]);

  const navigateToWorkspaces = useCallback(() => {
    if (params.workspace) {
      selectWorkspace(params.workspace);
      navigate(`/${params.workspace}`);
    } else {
      navigateToApplications();
    }
  }, [params.workspace, navigateToApplications, navigate, selectWorkspace]);

  const navigateToScenario = useCallback((scenarioId: string) => {
    if (params.workspace) {
      selectScenario(scenarioId);
      navigate(`/${params.workspace}/${scenarioId}`);
      setCurrentStepIndex(0);
    }
  }, [params.workspace, navigate, selectScenario]);

  // Obsługa formularza
  const handleChange = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const areRequiredFieldsFilled = useCallback(() => {
    return formFields.every(field => 
      !field.required || (formData[field.name] !== undefined && formData[field.name] !== "")
    );
  }, [formFields, formData]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e?.preventDefault) e.preventDefault();
    
    if (currentNode?.contextPath) {
      Object.entries(formData).forEach(([key, value]) => {
        updateContextPath(`${currentNode.contextPath}.${key}`, value);
      });
    }

    onSubmit?.(formData);
    return formData;
  }, [currentNode?.contextPath, formData, onSubmit, updateContextPath]);

  // Obsługa nawigacji
  const handleNext = useCallback((data?: any) => {
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 1000) return;
    lastNavigationTimeRef.current = now;

    if (data && currentNode?.contextPath) {
      updateContextPath(currentNode.contextPath, data);
    }

    if (isLast) {
      navigateToWorkspaces();
    } else {
      setCurrentStepIndex(idx => idx + 1);
      onSubmit?.(data);
    }
  }, [currentNode?.contextPath, isLast, navigateToWorkspaces, onSubmit, updateContextPath]);

  const handleBack = useCallback(() => {
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 1000) return;
    lastNavigationTimeRef.current = now;

    if (isFirst) {
      navigateToWorkspaces();
    } else {
      setCurrentStepIndex(idx => idx - 1);
      onPrevious?.();
    }
  }, [isFirst, navigateToWorkspaces, onPrevious]);

  // Interakcja z API
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return null;

    try {
      setIsLoading(true);
      setError(null);

      // Walidacja
      const token = await getToken();
      if (!token || !user) {
        throw new Error(token ? "Użytkownik nie zalogowany" : "Brak tokenu autoryzacji");
      }

      // Budowanie wiadomości
      const { systemMessage, initialUserMessage } = currentNode?.attrs || {};
      const messages = [];
      
      // Dodawanie schematu do wiadomości
      const addSchemaIfNeeded = (content: string) => {
        if (schema && !content.includes("```json")) {
          return `${content}\n\nUse the following JSON schema:\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
        }
        return content;
      };
      
      // System message
      if (systemMessage) {
        messages.push({ role: "system", content: systemMessage });
      }
      
      // Początkowa wiadomość użytkownika
      if (initialUserMessage) {
        const initialContent = addSchemaIfNeeded(processTemplate(initialUserMessage));
        messages.push({ role: "user", content: initialContent });
        
        // Odpowiedź asystenta jeśli dostępna
        if (processedAssistantMessage) {
          messages.push({ role: "assistant", content: processedAssistantMessage });
        }
      }
      
      // Aktualna wiadomość użytkownika
      messages.push({ role: "user", content: addSchemaIfNeeded(message) });

      // Wykonanie zapytania API
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`;
      setDebugInfo(`Wysyłanie do: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages, userId: user.uid }),
      });

      if (!isMountedRef.current) return null;
      
      // Obsługa błędów
      if (!response.ok) {
        throw new Error(await handleApiError(response, "send-message"));
      }

      // Przetwarzanie odpowiedzi
      const { success, data } = await response.json();
      const content = success && data?.message?.content;
      
      if (!content) throw new Error("Nieprawidłowy format odpowiedzi API");
      
      const extractedData = extractJsonFromContent(content);
      
      if (isMountedRef.current) {
        setResponseData(extractedData);
        if (currentNode?.contextPath && extractedData) {
          updateContextPath(currentNode.contextPath, extractedData);
        }
      }

      return extractedData;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : String(err));
      }
      return null;
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [
    getToken, 
    user, 
    currentNode?.attrs, 
    currentNode?.contextPath, 
    processTemplate, 
    processedAssistantMessage,
    schema, 
    updateContextPath
  ]);

  // Auto-start
  useEffect(() => {
    const shouldAutoStart = 
      currentNode?.tplFile === "llmStep" && 
      currentNode.attrs?.autoStart === true && 
      !autoStartExecutedRef.current && 
      !isLoading && 
      !responseData && 
      !error;
      
    if (shouldAutoStart) {
      autoStartExecutedRef.current = true;
      const initialMessage = currentNode.attrs?.initialUserMessage || "";
      if (initialMessage) {
        sendMessage(processTemplate(initialMessage));
      }
    }
  }, [
    currentNode?.tplFile,
    currentNode?.attrs?.autoStart,
    currentNode?.attrs?.initialUserMessage,
    isLoading,
    responseData,
    error,
    processTemplate,
    sendMessage,
  ]);

  return {
    currentNode,
    isFirstNode: isFirst,
    isLastNode: isLast,
    navigateToHome,
    navigateToApplications,
    navigateToWorkspaces,
    navigateToScenario,
    handleNext,
    handleBack,
    params,
    isLoading,
    error,
    processedAssistantMessage,
    formData,
    formFields,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
    responseData,
    sendMessage,
    schema,
    debugInfo,
    currentScenario,
    currentWorkspace,
    nodes,
  };
}