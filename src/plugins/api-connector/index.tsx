// src/plugins/api-connector/index.tsx
import ApiConnectorView from './components/ApiConnectorView';
import ApiConnectorConfig from './components/ApiConnectorConfig';
import ApiConnectorResult from './components/ApiConnectorResult';
import type { PluginProcessInput, PluginProcessResult } from '../PluginInterface';

// Funkcja processNode
const processNode = async (params: PluginProcessInput): Promise<PluginProcessResult> => {
  console.log('API Connector processNode: Raw config received:', JSON.stringify(params));
  const { input, config, node } = params;
  
  console.log('API Connector processNode: Processing node with input:', input);
  console.log('API Connector processNode: Current config:', config);
  
  // Sprawdź najpierw pluginConfig w danych węzła
  console.log('API Connector processNode: Node data:', node?.data);
  
  const nodePluginConfig = node?.data?.pluginConfig || {};
  console.log('API Connector processNode: Node plugin config:', nodePluginConfig);
  
  // Jeśli w konfiguracji węzła jest już odpowiedź, użyj jej
  if (nodePluginConfig.requestSent === true && nodePluginConfig.completionMessage) {
    console.log('API Connector processNode: Using node plugin config with completionMessage:', nodePluginConfig.completionMessage);
    return {
      output: nodePluginConfig.completionMessage,
      result: {
        status: 'completed',
        message: 'API request completed.',
        requiresUserAction: false
      }
    };
  }
  
  // Store the input message and prompt for use in the API request
  const updatedConfig = {
    ...config,
    nodeResponse: input,
    nodePrompt: node?.data?.processedPrompt || node?.data?.prompt || ''
  };
  
  // Check if the request should continue immediately
  const canContinue = config?.requestSent === true;
  
  if (!canContinue) {
    console.log('API Connector processNode: Waiting for user action');
    // Return a special result to indicate process should be paused
    return {
      output: "API request pending. Waiting for user action.",
      result: {
        status: 'waiting',
        message: 'Process is waiting for user to send the API request.',
        requiresUserAction: true,
        config: updatedConfig
      }
    };
  }
  
  console.log('API Connector processNode: Request completed, returning LLM response');
  
  // Process can continue, return the LLM response from completionMessage
  return {
    output: config?.completionMessage || input,
    result: {
      status: 'completed',
      message: 'API request completed.',
      requiresUserAction: false
    }
  };
};

// Plugin export
export default {
  id: 'api-connector',
  name: 'API Connector',
  description: 'Sends data from the node to an API endpoint with authentication',
  version: '1.0.0',
  activateByDefault: true,
  defaultConfig: {
    buttonText: 'Send API Request',
    apiUrl: '/api/v1/services/chat/completion',
    requestSent: false,
    requestSuccessful: false
  },
  ViewComponent: ApiConnectorView,
  ConfigComponent: ApiConnectorConfig,
  ResultComponent: ApiConnectorResult,
  processNode
};