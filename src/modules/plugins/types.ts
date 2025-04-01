/**
 * Plugin and LLM integration type definitions
 */
import { ComponentType } from "react";

/**
 * Props passed to each plugin component
 */
export interface PluginComponentProps<T = unknown> {
  /** Plugin-specific data */
  data: T | null;
  /** Application context data */
  appContext: AppContextData;
  
  /** UI replacement flags */
  replaceHeader?: boolean;
  replaceAssistantView?: boolean;
  replaceUserInput?: boolean;
}

/**
 * Static plugin settings defined at component level
 */
export interface PluginSettings {
  replaceHeader?: boolean;
  replaceAssistantView?: boolean;
  replaceUserInput?: boolean;
  hideNavigationButtons?: boolean;
}

/**
 * Schema definition for plugin options
 */
export interface PluginOptionSchema {
  /** Data type for the option */
  type: "string" | "number" | "boolean" | "color" | "select" | "json";
  /** Display label */
  label?: string;
  /** Help text */
  description?: string;
  /** Default value */
  default: unknown;
  /** Input field type (for string fields) */
  inputType?: "text" | "textarea" | "password" | "email";
  /** Options for select-type fields */
  options?: Array<{value: string | number | boolean, label: string}>;
  /** Validation rules */
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => boolean;
  };
  /** Conditional display logic */
  conditional?: {
    field: string;
    value: unknown;
    operator?: "eq" | "neq" | "gt" | "lt" | "gte" | "lte";
  };
}

/**
 * Extended React component type with plugin-specific properties
 */
export interface PluginComponentWithSchema<T = unknown> extends React.FC<PluginComponentProps<T>> {
  /** Schema definition for plugin options */
  optionsSchema?: Record<string, PluginOptionSchema>;
  /** Static plugin settings */
  pluginSettings?: PluginSettings;
}

/**
 * Plugin types
 */
export type PluginType = 'flow' | 'dashboard';

/**
 * Plugin registration state
 */
export interface Plugin {
  /** Unique plugin identifier */
  key: string;
  /** Whether the plugin is active */
  enabled: boolean;
  /** Plugin version */
  version?: string;
  /** Other plugins this plugin depends on */
  dependencies?: string[];
  /** Plugin type - flow or dashboard */
  type?: PluginType;
}

/**
 * Application context data passed to plugins
 */
export interface AppContextData {
  /** Current workspace data */
  currentWorkspace: WorkspaceData | null;
  /** Current scenario data */
  currentScenario: ScenarioData | null;
  /** Current node data */
  currentNode: NodeData | null;
  /** Current selection IDs */
  selection: {
    workspaceId: string;
    scenarioId: string;
    nodeId: string;
  };
  /** State version for change detection */
  stateVersion: number;
  
  /** Node content update functions */
  updateNodeUserPrompt?: (nodeId: string, prompt: string) => void;
  updateNodeAssistantMessage?: (nodeId: string, message: string) => void;
  
  /** Flow navigation functions */
  nextStep?: () => void;
  prevStep?: () => void;
  moveToNextNode?: (nodeId: string) => void;
  addNodeMessage?: (nodeId: string, message: string) => void;
  
  /** Authentication context */
  authContext?: AuthContextData;
  
  /** Context items retrieval function */
  getContextItems?: () => Array<{
    id: string;
    title: string;
    content: string;
    [key: string]: unknown;
  }>;
}

/**
 * Authentication context data
 */
export interface AuthContextData {
  /** Current authenticated user */
  currentUser: AuthUser | null;
  /** Auth loading state */
  isLoading: boolean;
  /** Sign in function */
  signIn: () => Promise<void>;
  /** Sign out function */
  signOut: () => Promise<void>;
  /** Get auth token function */
  getToken: () => Promise<string | null>;
  /** Available tokens count */
  availableTokens: number;
  /** Decrease tokens function */
  decreaseTokens: (amount: number) => void;
  /** Refresh user data function */
  refreshUserData: () => Promise<void>;
  /** Payment dialog visibility */
  showPaymentDialog: boolean;
  /** Payment dialog visibility setter */
  setShowPaymentDialog: (show: boolean) => void;
  /** Suppress payment dialog flag */
  suppressPaymentDialog: boolean;
  /** Suppress payment dialog setter */
  setSuppressPaymentDialog: (suppress: boolean) => void;
  /** Process payment function */
  processPayment: (tokenCount: number) => Promise<{success: boolean, checkoutUrl?: string} | false>;
}

/**
 * Authenticated user data
 */
export interface AuthUser {
  /** User ID */
  uid: string;
  /** User email */
  email: string;
  /** Available tokens count */
  availableTokens: number;
  /** Account creation date */
  createdAt: Date;
  /** Last login date */
  lastLoginAt: Date;
  /** User display name */
  name?: string;
  /** User role */
  role?: string;
}

/**
 * Dynamic component store for plugin management
 */
export interface DynamicComponentStore {
  /** Registered plugin components */
  components: Record<string, ComponentType<PluginComponentProps>>;
  /** Plugin component data */
  componentData: Record<string, unknown>;
  /** Plugin types mapping */
  pluginTypes: Record<string, PluginType>;

  /** Register a component */
  registerComponent: (
    key: string,
    component: ComponentType<PluginComponentProps>,
    type?: PluginType
  ) => void;
  /** Unregister a component */
  unregisterComponent: (key: string) => void;
  /** Set component data */
  setComponentData: (key: string, data: unknown) => void;
  /** Get component data */
  getComponentData: (key: string) => unknown;
  /** Get all registered component keys */
  getComponentKeys: () => string[];
  /** Get component keys by type */
  getComponentKeysByType: (type: PluginType) => string[];
  /** Get a component by key */
  getComponent: (key: string) => ComponentType<PluginComponentProps> | null;
  /** Get plugin type by key */
  getPluginType: (key: string) => PluginType | undefined;
  /** Set plugin type */
  setPluginType: (key: string, type: PluginType) => void;
}

/**
 * Application state interface for wrappers
 */
export interface AppState {
  /** Currently selected items */
  selected: {
    node: string;
    scenario: string;
    workspace: string;
  };
  /** Update node user prompt */
  updateNodeUserPrompt: (nodeId: string, prompt: string) => void;
  /** Update node assistant message */
  updateNodeAssistantMessage: (nodeId: string, message: string) => void;
}

/**
 * Workspace data structure
 */
export interface WorkspaceData {
  /** Workspace ID */
  id: string;
  /** Workspace name */
  name: string;
  /** Child scenarios */
  children: ScenarioData[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
  /** Owner ID */
  owner?: string;
  /** Additional fields */
  [key: string]: unknown;
}

/**
 * Scenario data structure
 */
export interface ScenarioData {
  /** Scenario ID */
  id: string;
  /** Scenario name */
  name: string;
  /** Child nodes */
  children: NodeData[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
  /** Scenario tags */
  tags?: string[];
  /** Additional fields */
  [key: string]: unknown;
}

/**
 * Node data structure
 */
export interface NodeData {
  /** Node ID */
  id: string;
  /** Node label */
  label?: string;
  /** Node name */
  name?: string;
  /** User input */
  userPrompt?: string;
  /** Assistant response */
  assistantMessage?: string;
  /** Plugin key if this node uses a plugin */
  pluginKey?: string;
  /** Plugin-specific data */
  pluginData?: Record<string, unknown>;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Node position on canvas */
  position?: { x: number; y: number };
  /** Next connected nodes */
  nextNodes?: string[];
  /** Previous connected nodes */
  prevNodes?: string[];
  /** Additional structured data */
  data?: {
    /** JSON format options for API responses */
    jsonFormat?: ResponseFormatOptions;
    /** Additional fields */
    [key: string]: unknown;
  };
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
  /** Additional fields */
  [key: string]: unknown;
}

/**
 * JSON response format options
 */
export interface ResponseFormatOptions {
  /** Response format type */
  type: "json" | "text";
  /** JSON schema definition */
  schema?: Record<string, unknown>;
}

/**
 * Props for the PluginPreviewWrapper component
 */
export interface PluginPreviewWrapperProps {
  /** Plugin component key */
  componentKey: string;
  /** Custom data to pass to the plugin */
  customData?: unknown;
  /** Custom application context */
  context?: Partial<AppContextData>;
  /** Whether to show the header */
  showHeader?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * Plugin data mapping type
 */
export type PluginDataMap = Record<string, unknown>;

/**
 * ApiService plugin configuration
 */
export interface ApiServiceData {
  /** Button text */
  buttonText?: string;
  /** Default assistant message */
  assistantMessage?: string;
  /** Whether to fill the user input */
  fillUserInput?: boolean;
  /** API endpoint URL */
  apiUrl?: string;
  /** Whether to use JSON response format */
  useJsonResponse?: boolean;
  /** JSON schema string */
  jsonSchema?: string;
  /** Context item key containing the JSON schema */
  contextJsonKey?: string;
}

/**
 * LLM service configuration
 */
export interface LlmServiceOptions {
  /** API endpoint path */
  apiUrl?: string;
  /** API base URL */
  apiBaseUrl?: string;
  /** Response format options */
  responseFormat?: ResponseFormatOptions;
  /** Context item key containing the JSON schema */
  contextJsonKey?: string;
}

/**
 * LLM request parameters
 */
export interface LlmRequestParams {
  /** User message to send to LLM */
  message: string;
  /** User ID */
  userId: string;
  /** Estimated token cost for the request */
  estimatedTokenCost?: number;
  /** Override response format */
  overrideResponseFormat?: ResponseFormatOptions;
}

/**
 * Token usage statistics
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
 * LLM response structure
 */
export interface LlmResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data?: {
    /** Message data */
    message?: {
      /** Text content */
      content?: string;
      /** Parsed JSON content */
      parsedJson?: Record<string, unknown>;
    };
    /** Token usage statistics */
    tokenUsage?: TokenUsage;
    /** Success flag */
    success?: boolean;
    /** Nested data */
    data?: {
      /** Nested message */
      message?: {
        /** Text content */
        content: string;
      };
    };
    /** Additional fields */
    [key: string]: unknown;
  };
  /** Error message if unsuccessful */
  error?: string;
}