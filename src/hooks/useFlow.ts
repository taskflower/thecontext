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
  // Hooks and state
  const navigate = useNavigate();
  const params = useParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [rawResponseData, setRawResponseData] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);
  
  // References
  const lastNavigationTimeRef = useRef(0);
  const isMountedRef = useRef(true);
  const autoStartExecutedRef = useRef(false);

  // Auth and store hooks
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

  // Current data
  const currentScenario = getCurrentScenario();
  const currentWorkspace = getCurrentWorkspace();

  // Nodes and current node
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

  // Setup and cleanup
  useEffect(() => {
    isMountedRef.current = true;
    autoStartExecutedRef.current = false;
    return () => { isMountedRef.current = false; };
  }, [currentNode?.id, currentNode?.tplFile]);

  // Load form fields and schema
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

  // Navigation functions
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

  // Form handling
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

  // Navigation handling
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

  // API interaction
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return null;

    try {
      setIsLoading(true);
      setError(null);
      setRawResponseData(null); // Reset raw response

      // Validation
      const token = await getToken();
      if (!token || !user) {
        throw new Error(token ? "Użytkownik nie zalogowany" : "Brak tokenu autoryzacji");
      }

      // Build message
      const { systemMessage, initialUserMessage } = currentNode?.attrs || {};
      const messages = [];
      
      // Add schema to messages if needed
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
      
      // Initial user message
      if (initialUserMessage) {
        const initialContent = addSchemaIfNeeded(processTemplate(initialUserMessage));
        messages.push({ role: "user", content: initialContent });
        
        // Assistant response if available
        if (processedAssistantMessage) {
          messages.push({ role: "assistant", content: processedAssistantMessage });
        }
      }
      
      // Current user message
      messages.push({ role: "user", content: addSchemaIfNeeded(message) });

      // API request execution
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
      
      // Error handling
      if (!response.ok) {
        throw new Error(await handleApiError(response, "send-message"));
      }

      // Response processing
      const { success, data } = await response.json();
      const content = success && data?.message?.content;
      
      if (!content) throw new Error("Nieprawidłowy format odpowiedzi API");
      
      // Store raw response
      setRawResponseData(content);
      
      // Extract JSON if available
      const extractedData = extractJsonFromContent(content);
      
      // If no JSON was extracted but we have content
      if (!extractedData && content) {
        if (isMountedRef.current) {
          setResponseData(null);
          
          // Store raw content in context if needed
          if (currentNode?.contextPath) {
            updateContextPath(`${currentNode.contextPath}_raw`, {
              content,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        return { 
          rawResponse: content,
          success: true 
        };
      }
      
      // If we have JSON data
      if (extractedData) {
        if (isMountedRef.current) {
          setResponseData(extractedData);
          if (currentNode?.contextPath) {
            updateContextPath(currentNode.contextPath, extractedData);
          }
        }
        
        return {
          ...extractedData,
          rawResponse: content,
          success: true
        };
      }
      
      // If we reach here, we have content but no JSON
      return { 
        rawResponse: content,
        success: false 
      };
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
      currentNode?.tplFile === "LlmStep" && 
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
    rawResponseData,
    sendMessage,
    schema,
    debugInfo,
    currentScenario,
    currentWorkspace,
    nodes,
  };
}