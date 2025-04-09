// src/core/NodeProcessor.ts
// Przetwarzanie węzłów przepływu

import { Node } from '../models/Node';
import { ContextService } from '../services/ContextService';
import { PluginService } from '../services/PluginService';
import { NodeData, NodeExecutionResult, PluginExecutionResult } from '../types/NodeTypes';

/**
 * Odpowiada za przetwarzanie węzłów przepływu
 */
export class NodeProcessor {
  private contextService: ContextService;
  private pluginService?: PluginService;

  constructor(contextService: ContextService, pluginService?: PluginService) {
    this.contextService = contextService;
    this.pluginService = pluginService;
  }

  /**
   * Przygotowuje węzeł do wyświetlenia, przetwarzając zmienne kontekstowe
   */
  prepareNodeForDisplay(node: Node): NodeData {
    // Głęboka kopia węzła
    const processedNode = node.clone();
    
    // Przetworzenie zmiennych kontekstowych w wiadomości asystenta
    if (processedNode.assistantMessage) {
      processedNode.assistantMessage = this.contextService.processTemplate(processedNode.assistantMessage);
    }
    
    return processedNode.toJSON();
  }

  /**
   * Wykonuje węzeł i aktualizuje kontekst
   */
  executeNode(
    node: Node, 
    userInput: string | undefined
  ): NodeExecutionResult {
    // Aktualizacja węzła z danymi użytkownika
    if (userInput !== undefined) {
      node.update({ userPrompt: userInput });
    }
    
    // Aktualizacja kontekstu jeśli węzeł ma klucz kontekstu
    if (node.contextKey && userInput !== undefined) {
      this.contextService.updateContext(
        node.contextKey,
        userInput,
        node.contextJsonPath
      );
      
      return {
        node: node.toJSON(),
        contextUpdated: true,
        updatedContext: this.contextService.getContext()
      };
    }
    
    return {
      node: node.toJSON(),
      contextUpdated: false,
      updatedContext: this.contextService.getContext()
    };
  }

  /**
   * Wykonuje plugin węzła
   */
  async executeNodePlugin(
    node: Node, 
    pluginParams: Record<string, any> = {}
  ): Promise<{ 
    result: PluginExecutionResult; 
    contextUpdated: boolean; 
    updatedContext: Record<string, any> 
  }> {
    if (!node.pluginKey) {
      throw new Error(`Węzeł o ID ${node.id} nie ma przypisanego pluginu`);
    }
    
    if (!this.pluginService) {
      throw new Error('Serwis pluginów nie został skonfigurowany');
    }
    
    // Wykonanie pluginu
    const result = await this.pluginService.executePlugin(
      node.pluginKey,
      node.id,
      {
        ...pluginParams,
        ...(node.pluginData || {})
      }
    );
    
    // Aktualizacja kontekstu na podstawie wyniku pluginu
    if (result.success && node.contextKey) {
      this.contextService.updateContext(
        node.contextKey,
        result.data,
        node.contextJsonPath
      );
      
      return {
        result,
        contextUpdated: true,
        updatedContext: this.contextService.getContext()
      };
    }
    
    return {
      result,
      contextUpdated: false,
      updatedContext: this.contextService.getContext()
    };
  }
}