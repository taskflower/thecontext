/**
 * Error handling utilities specific to the flow module
 * Provides specialized handling for plugin-related errors and flow state errors
 */
import errorService, { ErrorCode, ErrorResponse } from '@/services/ErrorService';

/**
 * Special error types for flow module
 */
export enum FlowErrorType {
  PLUGIN_LOAD_ERROR = 'PLUGIN_LOAD_ERROR',
  PLUGIN_EXECUTION_ERROR = 'PLUGIN_EXECUTION_ERROR',
  FLOW_PATH_ERROR = 'FLOW_PATH_ERROR',
  NODE_UPDATE_ERROR = 'NODE_UPDATE_ERROR',
  CONTEXT_UPDATE_ERROR = 'CONTEXT_UPDATE_ERROR',
  NAVIGATION_ERROR = 'NAVIGATION_ERROR',
}

/**
 * Handles plugin load errors
 * @param pluginKey - Key of the plugin that failed to load
 * @param error - Original error that occurred
 */
export const handlePluginLoadError = (pluginKey: string, error: unknown): ErrorResponse => {
  return errorService.handleError(
    errorService.createError(
      ErrorCode.PLUGIN_ERROR,
      `Failed to load plugin "${pluginKey}"`,
      {
        pluginKey,
        originalError: error,
        errorType: FlowErrorType.PLUGIN_LOAD_ERROR,
      }
    ),
    {
      showToast: true,
      logToConsole: true,
      notificationType: 'error',
    }
  );
};

/**
 * Handles plugin execution errors during runtime
 * @param pluginKey - Key of the plugin that failed
 * @param methodName - Name of the method that caused the error
 * @param error - Original error that occurred
 */
export const handlePluginExecutionError = (
  pluginKey: string,
  methodName: string,
  error: unknown
): ErrorResponse => {
  return errorService.handleError(
    errorService.createError(
      ErrorCode.PLUGIN_ERROR,
      `Error in plugin "${pluginKey}" method "${methodName}"`,
      {
        pluginKey,
        methodName,
        originalError: error,
        errorType: FlowErrorType.PLUGIN_EXECUTION_ERROR,
      }
    ),
    {
      showToast: true,
      logToConsole: true,
      notificationType: 'warning',
    }
  );
};

/**
 * Handles errors in flow path calculation
 * @param error - Original error that occurred
 * @param scenarioId - ID of the scenario being processed
 */
export const handleFlowPathError = (error: unknown, scenarioId?: string): ErrorResponse => {
  return errorService.handleError(
    errorService.createError(
      ErrorCode.INTERNAL_ERROR,
      'Unable to calculate flow path',
      {
        scenarioId,
        originalError: error,
        errorType: FlowErrorType.FLOW_PATH_ERROR,
      }
    ),
    {
      showToast: true,
      logToConsole: true,
    }
  );
};

/**
 * Handles node update errors
 * @param nodeId - ID of the node being updated
 * @param updateType - Type of update (e.g., 'userPrompt', 'assistantMessage')
 * @param error - Original error that occurred
 */
export const handleNodeUpdateError = (
  nodeId: string,
  updateType: string,
  error: unknown
): ErrorResponse => {
  return errorService.handleError(
    errorService.createError(
      ErrorCode.INTERNAL_ERROR,
      `Failed to update node ${updateType}`,
      {
        nodeId,
        updateType,
        originalError: error,
        errorType: FlowErrorType.NODE_UPDATE_ERROR,
      }
    ),
    {
      showToast: true,
      logToConsole: true,
    }
  );
};

/**
 * Handles context update errors
 * @param nodeId - ID of the node containing context data
 * @param error - Original error that occurred
 */
export const handleContextUpdateError = (nodeId: string, error: unknown): ErrorResponse => {
  return errorService.handleError(
    errorService.createError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to update context from node data',
      {
        nodeId,
        originalError: error,
        errorType: FlowErrorType.CONTEXT_UPDATE_ERROR,
      }
    ),
    {
      showToast: true,
      logToConsole: true,
    }
  );
};

/**
 * Safely executes plugin methods with error handling
 * @param plugin - Plugin instance
 * @param methodName - Method to call
 * @param pluginKey - Plugin identifier
 * @param args - Arguments to pass to the method
 */
export const safePluginCall = <T>(
  plugin: any,
  methodName: string,
  pluginKey: string,
  ...args: any[]
): T | null => {
  try {
    if (plugin && typeof plugin[methodName] === 'function') {
      return plugin[methodName](...args);
    }
    return null;
  } catch (error) {
    handlePluginExecutionError(pluginKey, methodName, error);
    return null;
  }
};

/**
 * Safely executes async plugin methods with error handling
 * @param plugin - Plugin instance
 * @param methodName - Method to call
 * @param pluginKey - Plugin identifier
 * @param args - Arguments to pass to the method
 */
export const safePluginCallAsync = async <T>(
  plugin: any,
  methodName: string,
  pluginKey: string,
  ...args: any[]
): Promise<T | null> => {
  try {
    if (plugin && typeof plugin[methodName] === 'function') {
      return await plugin[methodName](...args);
    }
    return null;
  } catch (error) {
    handlePluginExecutionError(pluginKey, methodName, error);
    return null;
  }
};

export default {
  handlePluginLoadError,
  handlePluginExecutionError,
  handleFlowPathError,
  handleNodeUpdateError,
  handleContextUpdateError,
  safePluginCall,
  safePluginCallAsync,
};