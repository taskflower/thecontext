// src/hooks/useFlowStep.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { NodeData, FormField } from '@/types';
import { useAuth } from './useAuth';
import { useAppStore } from '@/useAppStore';
import { extractJsonFromContent } from '@/utils';

export function useFlowStep({ 
  node, 
  onSubmit, 
  onPrevious
}: {
  node: NodeData;
  onSubmit: (data: any) => void;
  onPrevious: () => void;
  isFirstNode: boolean;
  isLastNode: boolean;
}) {
  // Navigation handling
  const handlePrevious = () => onPrevious();
  const handleComplete = (data: any) => onSubmit(data);

  // Form state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // LLM references
  const autoStartExecutedRef = useRef(false);
  const isMountedRef = useRef(true);
  const autoCompleteExecutedRef = useRef(false);
  
  // LLM state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);

  // Context data
  const { 
    processTemplate, 
    getContextPath, 
    updateContextPath 
  } = useAppStore();
  
  const { getToken, user } = useAuth();

  // Processed assistant message
  const processedAssistantMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';

  // Set mounted reference and reset autostart state on node change
  useEffect(() => {
    isMountedRef.current = true;
    autoStartExecutedRef.current = false;
    autoCompleteExecutedRef.current = false;
    
    return () => {
      isMountedRef.current = false;
    };
  }, [node.id, node.template]);

  // Get form fields from schema
  useEffect(() => {
    const attrs = node.attrs || {};
    if (!attrs.schemaPath) {
      setFormFields([]);
      return;
    }

    try {
      // Get schema from context
      const schemaData = getContextPath(attrs.schemaPath);
      
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
  }, [node.attrs, getContextPath]);

  // Get schema for LLM
  useEffect(() => {
    if (node.attrs?.schemaPath) {
      try {
        const schemaData = getContextPath(node.attrs.schemaPath);
        setSchema(schemaData);
      } catch (err) {
        setError(`Error getting schema: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [node.attrs?.schemaPath, getContextPath]);

  // Handle form changes
  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Check if required fields are filled
  const areRequiredFieldsFilled = () => {
    return formFields.every(
      field => !field.required || 
      (formData[field.name] !== undefined && formData[field.name] !== '')
    );
  };
  
  // Handle form submission
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
      if (node.attrs?.systemMessage) {
        messages.push({
          role: 'system',
          content: node.attrs.systemMessage,
        });
      }

      // Add initial message and assistant response
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
        if (node.contextPath && data) {
          updateContextPath(node.contextPath, data);
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
    node.attrs?.systemMessage,
    node.attrs?.initialUserMessage,
    node.contextPath,
    processTemplate,
    processedAssistantMessage,
    schema,
    updateContextPath
  ]);

  // KEY CHANGE: Auto-start handling for LLM
  useEffect(() => {
    const handleAutoStart = async () => {
      if (
        node.template === 'llm-step' && 
        node.attrs?.autoStart === true && 
        !autoStartExecutedRef.current && 
        !isLoading && 
        !responseData && 
        !error
      ) {
        // Set flag before sending to avoid duplicate calls
        autoStartExecutedRef.current = true;
        
        const initialMessage = node.attrs?.initialUserMessage || '';
        if (initialMessage) {
          const processedMessage = processTemplate(initialMessage);
          await sendMessage(processedMessage);
        }
      }
    };

    handleAutoStart();
  }, [
    node.template,
    node.id,
    node.attrs?.autoStart,
    node.attrs?.initialUserMessage,
    isLoading,
    responseData,
    error,
    processTemplate,
    sendMessage
  ]);

  return {
    // Common properties
    isLoading,
    error,
    processedAssistantMessage,
    handlePrevious,
    handleComplete,
    
    // Form properties
    formData,
    formFields,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
    
    // LLM properties
    responseData,
    sendMessage,
    schema,
    debugInfo
  };
}