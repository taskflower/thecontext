// src/types/NodeTypes.ts
// Definicje typów węzłów i powiązanych interfejsów

/**
 * Pozycja węzła w interfejsie graficznym
 */
export interface Position {
    x: number;
    y: number;
  }
  
  /**
   * Dane węzła przepływu
   */
  export interface NodeData {
    id?: string;
    scenarioId: string;
    type?: string;
    label: string;
    description?: string; 
    position?: Position;
    assistantMessage?: string;
    initialUserMessage?: string;
    userPrompt?: string;
    contextKey?: string;
    contextJsonPath?: string;
    pluginKey?: string;
    pluginData?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
    // Flaga wiadomości systemowej
    includeSystemMessage?: boolean;
    // ID szablonu do renderowania UI
    templateId?: string;
    // Pola formularza dla węzłów typu formularza
    formFields?: Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
      options?: string[];
    }>;
    [key: string]: any;
  }
  
  /**
   * Wynik wykonania węzła
   */
  export interface NodeExecutionResult {
    node: NodeData;
    contextUpdated: boolean;
    updatedContext: Record<string, any>;
  }
  
  /**
   * Wynik wykonania pluginu
   */
  export interface PluginExecutionResult {
    success: boolean;
    data: any;
    error?: string;
  }
  
  /**
   * Adapter przechowywania węzłów (np. dla bazy danych)
   */
  export interface NodeStoreAdapter {
    getNode(nodeId: string): Promise<NodeData | null>;
    getNodesByScenario(scenarioId: string): Promise<NodeData[]>;
    saveNode(nodeData: NodeData): Promise<NodeData>;
    deleteNode(nodeId: string): Promise<boolean>;
  }
  
  /**
   * Rozszerzony interfejs scenariusza
   */
  export interface Scenario {
    id: string;
    name: string;
    description: string;
    nodes: NodeData[];
    // Wiadomość systemowa dla interakcji z LLM
    systemMessage?: string;
    // Opcjonalne krawędzie dla reprezentacji grafu
    edges?: any[];
  }