/* eslint-disable @typescript-eslint/no-explicit-any */
// src/processors/NodeProcessor.ts
import { Node } from '../models/Node';
import { ContextProcessor } from './ContextProcessor';
import { NodeData, ContextItem, NodeExecutionResult, PluginExecutionResult } from '../types';

export class NodeProcessor {
  private contextProcessor: ContextProcessor;

  constructor() {
    this.contextProcessor = new ContextProcessor();
  }

  /**
   * Przygotowuje węzeł do wyświetlenia, przetwarzając zmienne kontekstowe
   */
  prepareNodeForDisplay(node: Node, contextItems: ContextItem[] = []): NodeData {
    // Głęboka kopia węzła
    const processedNode = node.clone();
    
    // Przetwarzanie zmiennych kontekstowych w wiadomości asystenta
    if (processedNode.assistantMessage) {
      processedNode.assistantMessage = this.contextProcessor
        .processTemplate(processedNode.assistantMessage, contextItems);
    }
    
    return processedNode.toJSON();
  }

  /**
   * Wykonuje węzeł i aktualizuje kontekst
   */
  executeNode(
    node: Node, 
    userInput: string | undefined, 
    contextItems: ContextItem[] = []
  ): NodeExecutionResult {
    // Aktualizacja węzła z wejściem użytkownika
    if (userInput !== undefined) {
      node.update({ userPrompt: userInput });
    }
    
    // Aktualizacja kontekstu, jeśli węzeł ma klucz kontekstowy
    if (node.contextKey && userInput !== undefined) {
      const updatedContext = this.contextProcessor.updateContext(
        contextItems,
        node.contextKey,
        userInput,
        node.contextJsonPath || null
      );
      
      return {
        node: node.toJSON(),
        contextUpdated: true,
        updatedContext
      };
    }
    
    return {
      node: node.toJSON(),
      contextUpdated: false,
      updatedContext: contextItems
    };
  }

  /**
   * Symuluje wykonanie pluginu węzła
   */
  executeNodePlugin(
    node: Node, 
    pluginParams: Record<string, any> = {}, 
    contextItems: ContextItem[] = []
  ): { result: PluginExecutionResult; contextUpdated: boolean; updatedContext: ContextItem[] } {
    if (!node.pluginKey) {
      throw new Error(`Node with ID ${node.id} does not have a plugin`);
    }
    
    // Symulowany wynik wykonania pluginu
    const result: PluginExecutionResult = {
      success: true,
      data: {
        message: 'Plugin executed successfully',
        nodeId: node.id,
        pluginKey: node.pluginKey,
        ...pluginParams
      }
    };
    
    // Aktualizacja kontekstu na podstawie wyniku pluginu
    if (node.contextKey) {
      const updatedContext = this.contextProcessor.updateContext(
        contextItems,
        node.contextKey,
        result.data,
        node.contextJsonPath || null
      );
      
      return {
        result,
        contextUpdated: true,
        updatedContext
      };
    }
    
    return {
      result,
      contextUpdated: false,
      updatedContext: contextItems
    };
  }
}