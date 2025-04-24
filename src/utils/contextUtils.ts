// src/utils/contextUtils.ts
import { getValueByPath, setValueByPath } from './byPath';

/**
 * Funkcje pomocnicze do manipulacji kontekstem
 */
export const contextUtils = {
  /**
   * Pobiera wartość z kontekstu po ścieżce dostępu
   */
  getValueByPath: getValueByPath,
  
  /**
   * Ustawia wartość w kontekście po ścieżce dostępu
   */
  setValueByPath: setValueByPath,
  
  /**
   * Aktualizuje kontekst dla określonego workspace
   */
  updateWorkspaceContext: (
    contexts: Record<string, any>,
    workspaceId: string | null,
    path: string,
    value: any
  ): Record<string, any> => {
    if (!workspaceId) return contexts;
    
    const wsContext = contexts[workspaceId] || {};
    const updatedContext = contextUtils.setValueByPath({...wsContext}, path, value);
    
    return {
      ...contexts,
      [workspaceId]: updatedContext
    };
  },
  
  /**
   * Aktualizuje kontekst po złożonej ścieżce (np. "user.preferences.theme")
   */
  updateByContextPath: (
    contexts: Record<string, any>,
    workspaceId: string | null,
    contextPath: string,
    value: any
  ): Record<string, any> => {
    if (!contextPath || !workspaceId) return contexts;
    
    const [key, ...rest] = contextPath.split(".");
    if (rest.length === 0) {
      return contextUtils.updateWorkspaceContext(contexts, workspaceId, key, value);
    } else {
      const wsContext = contexts[workspaceId] || {};
      const keyData = wsContext[key] ? { ...wsContext[key] } : {};
      const updatedKeyData = contextUtils.setValueByPath(keyData, rest.join("."), value);
      
      return contextUtils.updateWorkspaceContext(contexts, workspaceId, key, updatedKeyData);
    }
  },
  
  /**
   * Sprawdza czy ścieżka istnieje w kontekście
   */
  hasContextPath: (
    contexts: Record<string, any>,
    workspaceId: string | null, 
    path: string
  ): boolean => {
    if (!workspaceId || !path) return false;
    const context = contexts[workspaceId] || {};
    const value = getValueByPath(context, path);
    return value !== undefined && value !== null;
  },
  
  /**
   * Pobiera kontekst dla określonego workspace
   */
  getContext: (
    contexts: Record<string, any>,
    workspaceId: string | null
  ): Record<string, any> => {
    return workspaceId ? contexts[workspaceId] || {} : {};
  },
  
  /**
   * Pobiera wartość z kontekstu po ścieżce
   */
  getContextPath: (
    contexts: Record<string, any>,
    workspaceId: string | null,
    path: string
  ): any => {
    if (!path || !workspaceId) return undefined;
    const context = contextUtils.getContext(contexts, workspaceId);
    return getValueByPath(context, path);
  }
};