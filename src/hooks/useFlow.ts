// src/hooks/useFlow.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NodeData, FormField } from '@/types';
import { extractJsonFromContent } from '@/utils';
import { useAppStore, useAuth } from '@/hooks';

export function useFlow({
  node,
  onSubmit,
  onPrevious,
  isFirstNode,
  isLastNode
}: {
  node?: NodeData;
  onSubmit?: (data: any) => void;
  onPrevious?: () => void;
  isFirstNode?: boolean;
  isLastNode?: boolean;
} = {}) {
  const navigate = useNavigate();
  const params = useParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const lastNavigationTimeRef = useRef(0);
  
  const { getToken, user } = useAuth();
  const { 
    selectApplication, selectWorkspace, selectScenario, 
    getCurrentScenario, getCurrentWorkspace,
    getContextPath, updateContextPath, processTemplate
  } = useAppStore();
  
  const currentScenario = getCurrentScenario();
  const currentWorkspace = getCurrentWorkspace();
  
  const nodes = useMemo(() => {
    if (!currentScenario?.nodes) return [];
    return [...currentScenario.nodes].sort((a, b) => 
      (a.order !== undefined && b.order !== undefined) ? a.order - b.order :
      (a.order !== undefined) ? -1 : (b.order !== undefined) ? 1 : 0
    );
  }, [currentScenario]);
  
  const currentNode = node || nodes[currentStepIndex];
  const isFirst = isFirstNode !== undefined ? isFirstNode : currentStepIndex === 0;
  const isLast = isLastNode !== undefined ? isLastNode : currentStepIndex === nodes.length - 1;
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const autoStartExecutedRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);
  
  const processedAssistantMessage = currentNode?.assistantMessage 
    ? processTemplate(currentNode.assistantMessage) 
    : '';

  useEffect(() => {
    isMountedRef.current = true;
    autoStartExecutedRef.current = false;
    return () => { isMountedRef.current = false; };
  }, [currentNode?.id, currentNode?.template]);

  useEffect(() => {
    if (!currentNode?.attrs?.schemaPath) {
      setFormFields([]);
      return;
    }

    try {
      const schemaData = getContextPath(currentNode.attrs.schemaPath);
      setFormFields(Array.isArray(schemaData) ? schemaData : []);
    } catch {
      setFormFields([]);
    }
  }, [currentNode?.attrs, getContextPath]);

  useEffect(() => {
    if (currentNode?.attrs?.schemaPath) {
      try {
        setSchema(getContextPath(currentNode.attrs.schemaPath));
      } catch (err) {
        setError(`Error getting schema: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [currentNode?.attrs?.schemaPath, getContextPath]);

  const navigateToHome = useCallback(() => navigate('/'), [navigate]);
  
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

  const handleChange = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const areRequiredFieldsFilled = useCallback(() => {
    return formFields.every(field => 
      !field.required || (formData[field.name] !== undefined && formData[field.name] !== '')
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

  const handleNext = useCallback((data?: any) => {
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 1000) return;
    lastNavigationTimeRef.current = now;
    
    if (data && currentNode?.contextPath) {
      updateContextPath(currentNode.contextPath, data);
    }
    
    if (isLast) {
      navigateToWorkspaces();
      return;
    }
    
    setCurrentStepIndex(idx => idx + 1);
    onSubmit?.(data);
  }, [currentNode?.contextPath, isLast, navigateToWorkspaces, onSubmit, updateContextPath]);
  
  const handleBack = useCallback(() => {
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 1000) return;
    lastNavigationTimeRef.current = now;
    
    if (isFirst) {
      navigateToWorkspaces();
      return;
    }
    
    setCurrentStepIndex(idx => idx - 1);
    onPrevious?.();
  }, [isFirst, navigateToWorkspaces, onPrevious]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return null;

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("Authorization token unavailable");
      if (!user) throw new Error("User not logged in");

      const messages = [];
      if (currentNode?.attrs?.systemMessage) {
        messages.push({ role: 'system', content: currentNode.attrs.systemMessage });
      }

      if (currentNode?.attrs?.initialUserMessage) {
        const initialMessage = processTemplate(currentNode.attrs.initialUserMessage);
        let initialContent = initialMessage;
        
        if (schema && !initialContent.includes('```json')) {
          initialContent += `\n\nUse the following JSON schema:\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
        }

        messages.push({ role: 'user', content: initialContent });

        if (processedAssistantMessage) {
          messages.push({ role: 'assistant', content: processedAssistantMessage });
        }
      }

      let userContent = message;
      if (schema && !userContent.includes('```json')) {
        userContent += `\n\nUse the following JSON schema:\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
      }
      messages.push({ role: 'user', content: userContent });

      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`;
      setDebugInfo(`Sending to: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages, userId: user.uid }),
      });

      if (!isMountedRef.current) return null;
      
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
        } catch {
          throw new Error(`API request failed: ${response.status}`);
        }
      }

      const apiResponseData = await response.json();
      const content = apiResponseData?.success && apiResponseData?.data?.message?.content;
      
      if (!content) throw new Error('Invalid API response format');
      
      const data = extractJsonFromContent(content);
      
      if (isMountedRef.current) {
        setResponseData(data);
        if (currentNode?.contextPath && data) {
          updateContextPath(currentNode.contextPath, data);
        }
      }
      
      return data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : String(err));
      }
      return null;
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [
    getToken, user, currentNode?.attrs?.systemMessage,
    currentNode?.attrs?.initialUserMessage, currentNode?.contextPath,
    processTemplate, processedAssistantMessage, schema, updateContextPath
  ]);

  useEffect(() => {
    if (
      currentNode?.template === 'llmStep' && 
      currentNode.attrs?.autoStart === true && 
      !autoStartExecutedRef.current && 
      !isLoading && 
      !responseData && 
      !error
    ) {
      autoStartExecutedRef.current = true;
      const initialMessage = currentNode.attrs?.initialUserMessage || '';
      if (initialMessage) {
        sendMessage(processTemplate(initialMessage));
      }
    }
  }, [
    currentNode?.template, currentNode?.id, currentNode?.attrs?.autoStart,
    currentNode?.attrs?.initialUserMessage, isLoading, responseData, error,
    processTemplate, sendMessage
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
    nodes
  };
}