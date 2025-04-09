// src/core/NodeManager.ts
// Zarządzanie węzłami przepływu

import { Node } from '../models/Node';
import { NodeCollection } from '../models/NodeCollection';
import { NodeProcessor } from './NodeProcessor';
import { ContextService } from '../services/ContextService';
import { PluginService } from '../services/PluginService';
import { validateNode } from '../utils/nodeValidators';
import { NodeData, NodeExecutionResult, Position } from '../types/NodeTypes';

/**
 * Główna klasa zarządzająca węzłami przepływu
 */
export class NodeManager {
  private nodes: NodeCollection;
  private nodeProcessor: NodeProcessor;
  private contextService: ContextService;
  private pluginService?: PluginService;

  constructor(
    contextService: ContextService,
    initialNodes: NodeData[] = [],
    pluginService?: PluginService
  ) {
    this.contextService = contextService;
    this.pluginService = pluginService;
    this.nodes = new NodeCollection(initialNodes);
    this.nodeProcessor = new NodeProcessor(contextService, pluginService);
  }

  /**
   * Dodaje nowy węzeł
   */
  addNode(nodeData: NodeData): Node {
    validateNode(nodeData);
    return this.nodes.add(nodeData);
  }

  /**
   * Pobiera węzeł po ID
   */
  getNode(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Pobiera wszystkie węzły dla danego scenariusza
   */
  getNodesByScenario(scenarioId: string): Node[] {
    return this.nodes.getByScenario(scenarioId);
  }

  /**
   * Aktualizuje węzeł
   */
  updateNode(nodeId: string, data: Partial<NodeData>): Node | undefined {
    return this.nodes.update(nodeId, data);
  }

  /**
   * Usuwa węzeł
   */
  removeNode(nodeId: string): boolean {
    return this.nodes.remove(nodeId);
  }

  /**
   * Aktualizuje pozycję węzła
   */
  updateNodePosition(nodeId: string, position: Position): Node | undefined {
    return this.updateNode(nodeId, { position });
  }

  /**
   * Wykonuje węzeł i przetwarza kontekst
   */
  executeNode(
    nodeId: string, 
    userInput: string | undefined
  ): NodeExecutionResult | null {
    const node = this.getNode(nodeId);
    if (!node) return null;
    
    return this.nodeProcessor.executeNode(node, userInput);
  }

  /**
   * Przygotowuje węzeł do wyświetlenia
   */
  prepareNodeForDisplay(nodeId: string): NodeData | null {
    const node = this.getNode(nodeId);
    if (!node) return null;
    
    return this.nodeProcessor.prepareNodeForDisplay(node);
  }

  /**
   * Importuje węzły z tablicy
   */
  importNodes(nodesData: NodeData[]): void {
    nodesData.forEach(nodeData => {
      try {
        validateNode(nodeData);
        this.nodes.add(nodeData);
      } catch (error) {
        console.error(`Błąd importowania węzła ${nodeData.id}:`, error);
      }
    });
  }

  /**
   * Eksportuje wszystkie węzły do tablicy
   */
  exportNodes(): NodeData[] {
    return this.nodes.toArray().map(node => node.toJSON());
  }

  /**
   * Eksportuje węzły dla danego scenariusza
   */
  exportScenarioNodes(scenarioId: string): NodeData[] {
    return this.getNodesByScenario(scenarioId).map(node => node.toJSON());
  }

  /**
   * Przetwarza szablon z zmiennymi kontekstowymi
   */
  processTemplate(template: string): string {
    return this.contextService.processTemplate(template);
  }
}