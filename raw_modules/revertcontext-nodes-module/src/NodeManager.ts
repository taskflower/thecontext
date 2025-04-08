// src/NodeManager.ts
import { Node } from './models/Node';
import { NodeCollection } from './models/NodeCollection';
import { NodeProcessor } from './processors/NodeProcessor';
import { ContextProcessor } from './processors/ContextProcessor';
import { validateNode } from './utils/nodeValidators';
import { NodeData, ContextItem, NodeExecutionResult, Position } from './types';

export class NodeManager {
  private nodes: NodeCollection;
  private nodeProcessor: NodeProcessor;
  private contextProcessor: ContextProcessor;

  constructor(initialNodes: NodeData[] = []) {
    this.nodes = new NodeCollection(initialNodes);
    this.nodeProcessor = new NodeProcessor();
    this.contextProcessor = new ContextProcessor();
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
   * Zmienia pozycję węzła
   */
  updateNodePosition(nodeId: string, position: Position): Node | undefined {
    return this.updateNode(nodeId, { position });
  }

  /**
   * Wykonuje węzeł i przetwarza kontekst
   */
  executeNode(
    nodeId: string, 
    userInput: string | undefined, 
    contextItems: ContextItem[] = []
  ): NodeExecutionResult | null {
    const node = this.getNode(nodeId);
    if (!node) return null;
    
    return this.nodeProcessor.executeNode(node, userInput, contextItems);
  }

  /**
   * Przygotowuje węzeł do wyświetlenia
   */
  prepareNodeForDisplay(nodeId: string, contextItems: ContextItem[] = []): NodeData | null {
    const node = this.getNode(nodeId);
    if (!node) return null;
    
    return this.nodeProcessor.prepareNodeForDisplay(node, contextItems);
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
        console.error(`Error importing node ${nodeData.id}:`, error);
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
  processTemplate(template: string, contextItems: ContextItem[] = []): string {
    return this.contextProcessor.processTemplate(template, contextItems);
  }
}