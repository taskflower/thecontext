// src/hooks/useFlow.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NodeData, FormField } from '@/types';
import { useAppStore } from '@/useAppStore';
import { extractJsonFromContent } from '@/utils';
import { useAuth } from './useAuth';

/**
 * Ujednolicony hook do zarządzania przepływem (flow) w aplikacji.
 * Zastępuje funkcjonalność useFlowStep, useNavigation i częściowo useComponentLoader
 */
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
  const { application, workspace, scenario } = useParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const lastNavigationTimeRef = useRef(0);
  
  // Auth & API
  const { getToken, user } = useAuth();

  // Store & context
  const { 
    selectApplication, 
    selectWorkspace, 
    selectScenario, 
    getCurrentScenario,
    getCurrentWorkspace,
    getContextPath,
    updateContextPath,
    processTemplate
  } = useAppStore();
  
  // Current data
  const currentScenario = getCurrentScenario();
  const currentWorkspace = getCurrentWorkspace();
  
  // Get nodes with sorting
  const nodes = useMemo(() => {
    if (!currentScenario) return [];

    const unsortedNodes = currentScenario.nodes || [];
    
    // Sort nodes by order field
    return [...unsortedNodes].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return 0;
    });
  }, [currentScenario]);
  
  // Current node and position information
  const currentNode = node || nodes[currentStepIndex];
  const isFirst = isFirstNode !== undefined ? isFirstNode : currentStepIndex === 0;
  const isLast = isLastNode !== undefined ? isLastNode : currentStepIndex === nodes.length - 1;
  
  // Form state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // LLM references & state
  const autoStartExecutedRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);
  
  // Processed assistant message
  const processedAssistantMessage = currentNode?.assistantMessage 
    ? processTemplate(currentNode.assistantMessage) 
    : '';

  // Set mounted reference and reset autostart state on node change
  useEffect(() => {
    isMountedRef.current = true;
    autoStartExecutedRef.current = false;
    
    return () => {
      isMountedRef.current = false;
    };
  }, [currentNode?.id, currentNode?.template]);

  // Get form fields from schema
  useEffect(() => {
    if (!currentNode?.attrs?.schemaPath) {
      setFormFields([]);
      return;
    }

    try {
      // Get schema from context
      const schemaData = getContextPath(currentNode.attrs.schemaPath);
      
      if (!schemaData) {
        setFormFields([]);
        return;
      }

      // If data is already an array of form fields, use it directly
      if (Array.isArray(schemaData)) {
        setFormFields(schemaData);
        return;
      }
      
      // Otherwise check if schemaData is a proper form schema
      setFormFields(Array.isArray(schemaData) ? schemaData : []);
    } catch (err) {
      setFormFields([]);
    }
  }, [currentNode?.attrs, getContextPath]);

  // Get schema for LLM
  useEffect(() => {
    if (currentNode?.attrs?.schemaPath) {
      try {
        const schemaData = getContextPath(currentNode.attrs.schemaPath);
        setSchema(schemaData);
      } catch (err) {
        setError(`Error getting schema: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [currentNode?.attrs?.schemaPath, getContextPath]);

  // Page navigation
  const navigateToHome = useCallback(() => navigate('/'), [navigate]);
  
  const navigateToApplications = useCallback(() => {
    if (application) {
      selectApplication(application);
      navigate(`/app/${application}`);
    } else {
      navigateToHome();
    }
  }, [application, navigate, navigateToHome, selectApplication]);
  
  const navigateToWorkspaces = useCallback(() => {
    if (workspace) {
      selectWorkspace(workspace);
      navigate(`/${workspace}`);
    } else {
      navigateToApplications();
    }
  }, [workspace, navigateToApplications, navigate, selectWorkspace]);
  
  const navigateToScenario = useCallback((scenarioId: string) => {
    if (workspace) {
      selectScenario(scenarioId);
      navigate(`/${workspace}/${scenarioId}`);
      setCurrentStepIndex(0); // Reset to first step
    }
  }, [workspace, navigate, selectScenario]);

  // Handle form changes
  const handleChange = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Check if required fields are filled
  const areRequiredFieldsFilled = useCallback(() => {
    return formFields.every(
      field => !field.required || 
      (formData[field.name] !== undefined && formData[field.name] !== '')
    );
  }, [formFields, formData]);
  
  // Handle form submission
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (currentNode?.contextPath) {
      const basePath = currentNode.contextPath;
      Object.entries(formData).forEach(([key, value]) => {
        updateContextPath(`${basePath}.${key}`, value);
      });
    }
    
    if (onSubmit) {
      onSubmit(formData);
    }
    return formData;
  }, [currentNode?.contextPath, formData, onSubmit, updateContextPath]);

  // Node navigation in flow with protection against multiple calls
  const handleNext = useCallback((data?: any) => {
    // Prevent multiple calls in short time
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 1000) {
      return;
    }
    
    lastNavigationTimeRef.current = now;
    
    // Save data to context if provided
    if (data && currentNode?.contextPath) {
      updateContextPath(currentNode.contextPath, data);
    }
    
    // If this is the last step, return to scenario list
    if (isLast) {
      navigateToWorkspaces();
      return;
    }
    
    // Go to next step
    setCurrentStepIndex(idx => idx + 1);
    
    // If external handler provided, call it too
    if (onSubmit) {
      onSubmit(data);
    }
  }, [currentNode?.contextPath, isLast, navigateToWorkspaces, onSubmit, updateContextPath]);
  
  const handleBack = useCallback(() => {
    // Prevent multiple calls in short time
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 1000) {
      return;
    }
    
    lastNavigationTimeRef.current = now;
    
    // If this is the first step, return to scenario list
    if (isFirst) {
      navigateToWorkspaces();
      return;
    }
    
    // Go to previous step
    setCurrentStepIndex(idx => idx - 1);
    
    // If external handler provided, call it too
    if (onPrevious) {
      onPrevious();
    }
  }, [isFirst, navigateToWorkspaces, onPrevious]);

  // Send message to LLM
  const sendMessage = useCallback(async (message: string) => {
    try {
      if (!message.trim()) return null;

      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("Authorization token unavailable. Please login again.");
      }

      if (!user) {
        throw new Error("User not logged in. Please login again.");
      }

      // Prepare messages
      const messages = [];

      // Add system message if required
      if (currentNode?.attrs?.systemMessage) {
        messages.push({
          role: 'system',
          content: currentNode.attrs.systemMessage,
        });
      }

      // Add initial message and assistant response
      if (currentNode?.attrs?.initialUserMessage) {
        const initialMessage = processTemplate(currentNode.attrs.initialUserMessage);
        
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

        if (processedAssistantMessage) {
          messages.push({
            role: 'assistant',
            content: processedAssistantMessage,
          });
        }
      }

      // Add current user message
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

      // Prepare API payload
      const payload = {
        messages: messages,
        userId: user.uid,
      };
      
      // Set debug info
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`;
      setDebugInfo(`Sending to: ${apiUrl}`);

      // Call API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Check if component is still mounted
      if (!isMountedRef.current) return null;

      // Handle API errors
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
        } catch {
          throw new Error(`API request failed: ${response.status}`);
        }
      }

      // Process response
      const apiResponseData = await response.json();
      
      const content = apiResponseData?.success && apiResponseData?.data?.message?.content;
      
      if (!content) {
        throw new Error('Invalid API response format');
      }
      
      const data = extractJsonFromContent(content);
      
      if (isMountedRef.current) {
        setResponseData(data);

        // Save data to context if contextPath provided
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
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    getToken,
    user,
    currentNode?.attrs?.systemMessage,
    currentNode?.attrs?.initialUserMessage,
    currentNode?.contextPath,
    processTemplate,
    processedAssistantMessage,
    schema,
    updateContextPath
  ]);

  // Auto-start handling for LLM
  useEffect(() => {
    const handleAutoStart = async () => {
      if (
        currentNode?.template === 'llm-step' && 
        currentNode.attrs?.autoStart === true && 
        !autoStartExecutedRef.current && 
        !isLoading && 
        !responseData && 
        !error
      ) {
        // Set flag before sending to avoid duplicate calls
        autoStartExecutedRef.current = true;
        
        const initialMessage = currentNode.attrs?.initialUserMessage || '';
        if (initialMessage) {
          const processedMessage = processTemplate(initialMessage);
          await sendMessage(processedMessage);
        }
      }
    };

    handleAutoStart();
  }, [
    currentNode?.template,
    currentNode?.id,
    currentNode?.attrs?.autoStart,
    currentNode?.attrs?.initialUserMessage,
    isLoading,
    responseData,
    error,
    processTemplate,
    sendMessage
  ]);

  return {
    // Navigation
    currentNode,
    isFirstNode: isFirst,
    isLastNode: isLast,
    navigateToHome,
    navigateToApplications,
    navigateToWorkspaces,
    navigateToScenario,
    handleNext,
    handleBack,
    
    // URL parameters
    params: { application, workspace, scenario },
    
    // Common flow state
    isLoading,
    error,
    processedAssistantMessage,
    
    // Form state
    formData,
    formFields,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
    
    // LLM state
    responseData,
    sendMessage,
    schema,
    debugInfo,
    
    // Current data
    currentScenario,
    currentWorkspace,
    nodes
  };
}