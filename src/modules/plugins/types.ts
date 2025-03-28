// src/modules/plugins/types.ts
import { ComponentType } from "react";

// Props przekazywane do każdego pluginu
export interface PluginComponentProps<T = unknown> {
  data: T | null;
  appContext: AppContextData;
  
  // Opcjonalne zastąpienie UI
  replaceHeader?: boolean;
  replaceAssistantView?: boolean;
  replaceUserInput?: boolean;
}

// Statyczne ustawienia pluginu
export interface PluginSettings {
  replaceHeader?: boolean;
  replaceAssistantView?: boolean;
  replaceUserInput?: boolean;
  hideNavigationButtons?: boolean; // Nowa opcja do ukrywania przycisków nawigacyjnych
}

// Rozszerzony typ dla opcji schematów, aby uwzględnić nowe typy pól
export interface PluginOptionSchema {
  type: "string" | "number" | "boolean" | "color" | "select" | "json"; // Dodano typ 'json'
  label?: string;
  description?: string;
  default: unknown;
  inputType?: "text" | "textarea" | "password" | "email"; // Opcjonalny typ inputu
  options?: Array<{value: string | number | boolean, label: string}>; // Opcje dla typu 'select'
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => boolean;
  };
  conditional?: { // Warunkowe wyświetlanie pola
    field: string;
    value: unknown;
    operator?: "eq" | "neq" | "gt" | "lt" | "gte" | "lte";
  };
}

// Rozszerzony typ komponentu dla pluginu, który zawiera dodatkowe statyczne właściwości
export interface PluginComponentWithSchema<T = unknown> extends React.FC<PluginComponentProps<T>> {
  optionsSchema?: Record<string, PluginOptionSchema>;
  pluginSettings?: PluginSettings;
}

// Definicja stanu pluginu
export interface Plugin {
  key: string;
  enabled: boolean;
  version?: string; // Dodana wersja pluginu
  dependencies?: string[]; // Dodane zależności między pluginami
}

// Dane kontekstu aplikacji przekazywane do pluginów
export interface AppContextData {
  currentWorkspace: WorkspaceData | null;
  currentScenario: ScenarioData | null;
  currentNode: NodeData | null;
  selection: {
    workspaceId: string;
    scenarioId: string;
    nodeId: string;
  };
  stateVersion: number;
  
  // Funkcje aktualizujące komunikaty węzłów
  updateNodeUserPrompt?: (nodeId: string, prompt: string) => void;
  updateNodeAssistantMessage?: (nodeId: string, message: string) => void;
  
  // Funkcje nawigacyjne dla flow
  nextStep?: () => void;
  prevStep?: () => void;
  moveToNextNode?: (nodeId: string) => void; // Funkcja używana w ApiServicePlugin
  addNodeMessage?: (nodeId: string, message: string) => void; // Funkcja używana w ApiServicePlugin
  
  // Dodane odwołanie do kontekstu autoryzacji
  authContext?: AuthContextData;
}

// Interfejs dla kontekstu autoryzacji
export interface AuthContextData {
  currentUser: AuthUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  availableTokens: number;
  decreaseTokens: (amount: number) => void;
  refreshUserData: () => Promise<void>;
  showPaymentDialog: boolean;
  setShowPaymentDialog: (show: boolean) => void;
  suppressPaymentDialog: boolean;
  setSuppressPaymentDialog: (suppress: boolean) => void;
  processPayment: (tokenCount: number) => Promise<{success: boolean, checkoutUrl?: string} | false>;
}

// Interfejs dla danych użytkownika
export interface AuthUser {
  uid: string;
  email: string;
  availableTokens: number;
  createdAt: Date;
  lastLoginAt: Date;
  name?: string;
  role?: string;
}

// Interfejs dla dynamicznego store'u komponentów
export interface DynamicComponentStore {
  components: Record<string, ComponentType<PluginComponentProps>>;
  componentData: Record<string, unknown>;

  registerComponent: (
    key: string,
    component: ComponentType<PluginComponentProps>
  ) => void;
  unregisterComponent: (key: string) => void;
  setComponentData: (key: string, data: unknown) => void;
  getComponentData: (key: string) => unknown;
  getComponentKeys: () => string[];
  getComponent: (key: string) => ComponentType<PluginComponentProps> | null;
}

// Rozszerzenie stanu aplikacji, który może być używany w wrapperach
export interface AppState {
  selected: {
    node: string;
    scenario: string;
    workspace: string;
  };
  updateNodeUserPrompt: (nodeId: string, prompt: string) => void;
  updateNodeAssistantMessage: (nodeId: string, message: string) => void;
}

// Typy odpowiadające strukturom danych aplikacji
export interface WorkspaceData {
  id: string;
  name: string;
  children: ScenarioData[];
  metadata?: Record<string, unknown>; // Dodane metadane
  createdAt?: Date;
  updatedAt?: Date;
  owner?: string;
  [key: string]: unknown;
}

export interface ScenarioData {
  id: string;
  name: string;
  children: NodeData[];
  metadata?: Record<string, unknown>; // Dodane metadane
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  [key: string]: unknown;
}

export interface NodeData {
  id: string;
  label?: string;
  name?: string;
  userPrompt?: string;
  assistantMessage?: string;
  pluginKey?: string;
  pluginData?: Record<string, unknown>;
  metadata?: Record<string, unknown>; // Dodane metadane
  position?: { x: number; y: number }; // Pozycja węzła na canvas
  nextNodes?: string[]; // Węzły, do których ten węzeł jest połączony
  prevNodes?: string[]; // Węzły, które prowadzą do tego węzła
  data?: { // Dodatkowe dane, w tym jsonFormat używany przez ApiServicePlugin
    jsonFormat?: ResponseFormatOptions;
    [key: string]: unknown;
  };
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

// Interfejs dla opcji formatu odpowiedzi JSON
export interface ResponseFormatOptions {
  type: "json" | "text";
  schema?: Record<string, unknown>; // Schemat JSON
}

// Props dla komponentu PluginPreviewWrapper
export interface PluginPreviewWrapperProps {
  componentKey: string;
  customData?: unknown;
  context?: Partial<AppContextData>;
  showHeader?: boolean;
  className?: string;
}

// Mapowanie danych pluginów
export type PluginDataMap = Record<string, unknown>;

// Interfejs dla opcji pluginu ApiService
export interface ApiServiceData {
  buttonText?: string;
  assistantMessage?: string;
  fillUserInput?: boolean;
  apiUrl?: string;
  useJsonResponse?: boolean;
  jsonSchema?: string;
  contextJsonKey?: string;
}

// Interfejs dla opcji usługi LLM
export interface LlmServiceOptions {
  apiUrl?: string;
  apiBaseUrl?: string;
  responseFormat?: ResponseFormatOptions;
  contextJsonKey?: string;
}

// Interfejs dla parametrów żądania LLM
export interface LlmRequestParams {
  message: string;
  userId: string;
  estimatedTokenCost?: number;
  overrideResponseFormat?: ResponseFormatOptions;
}

// Interfejs dla wykorzystania tokenów
export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

// Interfejs dla odpowiedzi LLM
export interface LlmResponse {
  success: boolean;
  data?: {
    message?: {
      content?: string;
      parsedJson?: Record<string, unknown>;
    };
    tokenUsage?: TokenUsage;
    success?: boolean;
    data?: {
      message?: {
        content: string;
      };
    };
    [key: string]: unknown;
  };
  error?: string;
}