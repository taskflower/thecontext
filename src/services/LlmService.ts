/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * LLM (Language Learning Model) Service for handling communication with LLM APIs
 */
import { PluginAuthAdapter } from "./PluginAuthAdapter";

/**
 * Configuration options for the LLM service
 */
export interface LlmServiceOptions {
  /** API endpoint path (e.g., "api/v1/services/chat/completion") */
  apiUrl?: string;
  /** API base URL (e.g., "https://api.example.com") */
  apiBaseUrl?: string;
  /** Default response format options */
  responseFormat?: ResponseFormatOptions;
  /** Context item key containing JSON schema as string */
  contextJsonKey?: string;
}

/**
 * Response format options for the LLM API
 */
export interface ResponseFormatOptions {
  /** Response format type */
  type: "json" | "text";
  /** Schema definition for JSON responses */
  schema?: Record<string, unknown>;
}

/**
 * Parameters for an LLM API request
 */
export interface LlmRequestParams {
  /** User message to send to the LLM */
  message: string;
  /** User ID for tracking and billing */
  userId: string;
  /** Estimated token cost for the request (optional) */
  estimatedTokenCost?: number;
  /** Override response format (takes precedence over other formats) */
  overrideResponseFormat?: ResponseFormatOptions;
}

/**
 * Token usage statistics from an LLM response
 */
export interface TokenUsage {
  /** Prompt tokens used */
  prompt: number;
  /** Completion tokens used */
  completion: number;
  /** Total tokens used */
  total: number;
}

/**
 * Message structure in LLM request/response
 */
export interface LlmMessage {
  /** The role of the message sender (system, user, assistant) */
  role: "system" | "user" | "assistant";
  /** The message content */
  content: string;
}

/**
 * Request payload for LLM API
 */
export interface LlmRequestPayload {
  /** Array of messages in the conversation */
  messages: LlmMessage[];
  /** User ID for tracking */
  userId: string;
  /** Response format specification (for OpenAI-compatible APIs) */
  response_format?: { type: string };
}

/**
 * Message in LLM response
 */
export interface LlmResponseMessage {
  /** Text content of the message */
  content?: string;
  /** Parsed JSON from the message content (when using JSON response format) */
  parsedJson?: Record<string, unknown>;
}

/**
 * Response data from an LLM API
 */
export interface LlmResponseData {
  /** Response message */
  message?: LlmResponseMessage;
  /** Token usage statistics */
  tokenUsage?: TokenUsage;
  /** Success flag */
  success?: boolean;
  /** Additional fields */
  [key: string]: unknown;
}

/**
 * Response from an LLM API request
 */
export interface LlmResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data?: LlmResponseData;
  /** Error message if unsuccessful */
  error?: string;
}

/**
 * Context item structure
 */
export interface ContextItem {
  /** Item ID */
  id: string;
  /** Item title */
  title: string;
  /** Item content */
  content: string;
  /** Additional fields */
  [key: string]: unknown;
}

/**
 * Service for handling communication with LLM APIs
 */
export class LlmService {
  private readonly defaultApiUrl = "api/v1/services/chat/completion";
  private readonly defaultApiBaseUrl: string;
  private readonly authContextRef: Record<string, unknown> | null;

  /**
   * Creates a new instance of the LlmService
   * @param authAdapter Authentication adapter for user management
   * @param options Service configuration options
   */
  constructor(
    private readonly authAdapter: PluginAuthAdapter, 
    private readonly options: LlmServiceOptions = {}
  ) {
    this.defaultApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.authContextRef = this.authAdapter.appContext?.authContext || null;
    
    console.log('LlmService initialized with options:', JSON.stringify(options));
  }

  /**
   * Estimates token cost of a message
   * @param message The message to estimate cost for
   * @returns Estimated token count
   */
  private estimateTokenCost(message: string): number {
    // Simple estimation: ~4 characters per token
    return Math.ceil(message.length / 4);
  }

  /**
   * Safely calls a method on the auth context if available
   * @param methodName Name of the method to call
   * @param args Arguments to pass to the method
   * @returns Method result or null if method not available
   */
  private safelyCallAuthMethod(methodName: string, ...args: unknown[]): unknown {
    if (
      this.authContextRef && 
      methodName in this.authContextRef && 
      typeof this.authContextRef[methodName] === 'function'
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      return (this.authContextRef[methodName] as Function)(...args);
    }
    return null;
  }
  
  /**
   * Cleans text from markdown formatting and other elements that might interfere with JSON parsing
   * @param text Text to clean
   * @returns Cleaned text containing only JSON
   */
  private cleanJsonContent(text: string): string {
    if (!text) return '';
    
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\s*|\s*```/g, '');
    
    // Remove other potential markdown marks
    cleaned = cleaned.replace(/`/g, '');
    
    // Remove JSON-style comments
    cleaned = cleaned.replace(/\/\/.*$/gm, '');
    
    // Remove whitespace at the beginning and end
    cleaned = cleaned.trim();
    
    // Check if the text starts with { or [ and ends with } or ]
    // If not, try to find JSON in the text
    if (!(cleaned.startsWith('{') && cleaned.endsWith('}')) && 
        !(cleaned.startsWith('[') && cleaned.endsWith(']'))) {
      
      // Look for the first occurrence of { or [
      const startBrace = cleaned.indexOf('{');
      const startBracket = cleaned.indexOf('[');
      
      let startPos = -1;
      if (startBrace >= 0 && startBracket >= 0) {
        // Choose the one that appears earlier
        startPos = Math.min(startBrace, startBracket);
      } else if (startBrace >= 0) {
        startPos = startBrace;
      } else if (startBracket >= 0) {
        startPos = startBracket;
      }
      
      if (startPos >= 0) {
        // Find the matching closing bracket
        const isObject = cleaned.charAt(startPos) === '{';
        let depth = 1;
        let endPos = -1;
        
        for (let i = startPos + 1; i < cleaned.length; i++) {
          const char = cleaned.charAt(i);
          if ((isObject && char === '{') || (!isObject && char === '[')) {
            depth++;
          } else if ((isObject && char === '}') || (!isObject && char === ']')) {
            depth--;
            if (depth === 0) {
              endPos = i;
              break;
            }
          }
        }
        
        if (endPos > startPos) {
          cleaned = cleaned.substring(startPos, endPos + 1);
        }
      }
    }
    
    return cleaned;
  }
  
  /**
   * Gets JSON format from context using the specified context key
   * @returns Response format options or undefined if not found
   */
  private getJsonFormatFromContext(): ResponseFormatOptions | undefined {
    if (!this.options.contextJsonKey) {
      return undefined;
    }
    
    try {
      // Get the application context
      const appContext = this.authAdapter.appContext;
      if (!appContext) {
        console.error('No application context available');
        return undefined;
      }
      
      // Check if the context key points to an element in the context system
      // Get context items from the current workspace
      if (typeof appContext.getContextItems === 'function') {
        const contextItems = appContext.getContextItems() as ContextItem[];
        
        // Look for a context item with a title matching the context key
        const contextItem = contextItems.find(item => item.title === this.options.contextJsonKey);
        if (contextItem && contextItem.content) {
          console.log(`Found context item with title "${this.options.contextJsonKey}"`);
          console.log('Context item content:', contextItem.content.substring(0, 100) + '...');
          
          // Try to repair and parse the content as JSON
          try {
            // Fix potential JSON issues - convert single quotes to double quotes
            const fixedContent = contextItem.content
              .replace(/(\w+):/g, '"$1":') // Fix key names without quotes
              .replace(/'/g, '"');         // Convert single quotes to double quotes
            
            // Display fixed content for debugging
            console.log('Fixed JSON content:', fixedContent.substring(0, 100) + '...');
            
            // Try to parse the fixed content
            let parsedContent;
            try {
              parsedContent = JSON.parse(fixedContent);
            } catch (fixError) {
              console.warn('JSON repair attempt failed, trying alternative method:', fixError);
              
              // Try to build a format object "manually" from text
              // Assume it's an object with JSON schema structure
              return {
                type: 'json',
                schema: {
                  type: 'object',
                  description: 'Schema extracted from context item: ' + this.options.contextJsonKey,
                  properties: {}
                }
              };
            }
            
            // Check if the content has the correct format (or adjust it)
            if (parsedContent && typeof parsedContent === 'object') {
              const responseFormat: ResponseFormatOptions = {
                type: 'json',
                schema: parsedContent
              };
              console.log('Successfully created JSON format from context content');
              return responseFormat;
            }
          } catch (parseError) {
            console.error(`Error parsing JSON from context item "${this.options.contextJsonKey}":`, parseError);
            
            // Return a simple JSON format as fallback
            return {
              type: 'json',
              schema: {
                type: 'object',
                description: 'Fallback schema since parsing failed'
              }
            };
          }
        } else {
          console.warn(`No context item found with title "${this.options.contextJsonKey}"`);
        }
      } else {
        // Alternative method - look in node data if appContext contains node information
        const currentNode:any = appContext.currentNode;
        if (currentNode) {
          console.log('Attempting to get data from node:', currentNode);
          
          // Check if the node directly contains JSON format data
          if (currentNode.data?.jsonFormat) {
            console.log('Found JSON format in node data:', currentNode.data.jsonFormat);
            return currentNode.data.jsonFormat as ResponseFormatOptions;
          }
          
          // Check if the context key points to a path in node data
          const keyPath = this.options.contextJsonKey.split('.');
          let value: Record<string, unknown> | null = currentNode;
          
          for (const key of keyPath) {
            if (value && typeof value === 'object' && key in value) {
              value = value[key] as Record<string, unknown>;
            } else {
              console.warn(`Context key path ${this.options.contextJsonKey} not found in node`);
              value = null;
              break;
            }
          }
          
          if (
            value && 
            typeof value === 'object' && 
            'type' in value && 
            value.type === 'json'
          ) {
            console.log('Found JSON format via path in node:', value);
            return value as unknown as ResponseFormatOptions;
          }
        }
      }
      
      // As a last resort, return a simple JSON format
      console.warn('Failed to get JSON format from context, using default format');
      return {
        type: 'json',
        schema: {
          type: 'object',
          description: 'Default JSON response format'
        }
      };
    } catch (error) {
      console.error('Error getting JSON format from context:', error);
      
      // Even in case of error, return a simple JSON format
      return {
        type: 'json',
        schema: {
          type: 'object',
          description: 'Error fallback JSON schema'
        }
      };
    }
  }

  /**
   * Sends a request to the LLM API
   * @param params Request parameters
   * @returns Promise resolving to the LLM response
   */
  async sendRequest(params: LlmRequestParams): Promise<LlmResponse> {
    const estimatedCost = params.estimatedTokenCost || this.estimateTokenCost(params.message);
    
    try {
      // Decrease token count before request
      this.safelyCallAuthMethod('decreaseTokens', estimatedCost);
      
      // Get user authentication token
      const token = await this.authAdapter.getCurrentUserToken();
      
      // Build API URL
      const apiBaseUrl = this.options.apiBaseUrl || this.defaultApiBaseUrl;
      const apiPath = this.options.apiUrl || this.defaultApiUrl;
      const baseUrlNormalized = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const apiPathNormalized = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath;
      const apiUrl = `${baseUrlNormalized}/${apiPathNormalized}`;
      
      console.log('Making API request to:', apiUrl);
      
      // Prepare request headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('No auth token available for API request');
      }
      
      // Get JSON format from context (if configured)
      const contextFormat = this.getJsonFormatFromContext();
      const responseFormat = params.overrideResponseFormat || contextFormat || this.options.responseFormat;
      
      // Debug: Show selected formats
      console.log('Context format:', contextFormat);
      console.log('Override format:', params.overrideResponseFormat);
      console.log('Options format:', this.options.responseFormat);
      console.log('Selected response format:', responseFormat);
      
      // Prepare basic payload
      const requestPayload: LlmRequestPayload = {
        messages: [
          { role: "user", content: params.message }
        ],
        userId: params.userId
      };
      
      // Add response format if specified
      if (responseFormat?.type === "json") {
        // OpenAI-compatible format
        requestPayload.response_format = { type: "json_object" };
        
        // Add schema instruction in system message content if schema is specified
        if (responseFormat.schema) {
          requestPayload.messages.unshift({
            role: "system",
            content: `Your response must be a JSON object that adheres to the following schema: ${JSON.stringify(responseFormat.schema, null, 2)}`
          });
          
          console.log('Added JSON schema instruction to system message');
        }
        
        console.log('Using JSON response format:', JSON.stringify(requestPayload.response_format));
      }
      
      console.log('Final request payload:', JSON.stringify(requestPayload));
      
      // Send the request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status: ${response.status}, message: ${errorText}`);
      }
      
      // Parse response data
      const data = await response.json();
      
      // Try to parse JSON content if response format is JSON
      if (responseFormat?.type === 'json' && data?.data?.message?.content) {
        try {
          const content = data.data.message.content;
          if (typeof content === 'string') {
            // Clean content from markdown formatting and other potential issues
            const cleanedContent = this.cleanJsonContent(content);
            console.log('Cleaned JSON content:', cleanedContent);
            
            try {
              data.data.message.parsedJson = JSON.parse(cleanedContent);
              console.log('Successfully parsed cleaned JSON response');
            } catch (innerError) {
              console.warn('Failed to parse cleaned JSON, trying additional methods:', innerError);
              
              // If it still fails, try to extract JSON using regex
              const jsonRegex = /{[\s\S]*}/; // Simple regex for JSON object
              const match = content.match(jsonRegex);
              
              if (match && match[0]) {
                try {
                  data.data.message.parsedJson = JSON.parse(match[0]);
                  console.log('Successfully parsed JSON using regex extraction');
                } catch (regexError) {
                  console.error('All JSON parsing methods failed:', regexError);
                }
              }
            }
          } else if (typeof content === 'object') {
            data.data.message.parsedJson = content;
            console.log('Response content is already an object');
          }
        } catch (error) {
          console.warn('Failed to parse JSON response:', error);
        }
      }
      
      // Refresh user data to update token count
      this.safelyCallAuthMethod('refreshUserData');
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("LLM API error:", error);
      
      // Refresh user data even in case of error
      this.safelyCallAuthMethod('refreshUserData');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}