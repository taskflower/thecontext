// src/models/NodeCollection.ts
// Kolekcja węzłów przepływu

import { Node } from './Node';
import { NodeData } from '../types/NodeTypes';

/**
 * Kolekcja węzłów zarządzająca zbiorem węzłów
 */
export class NodeCollection {
  private nodes: Map<string, Node> = new Map();

  constructor(nodesData: NodeData[] = []) {
    nodesData.forEach(nodeData => {
      const node = new Node(nodeData);
      this.nodes.set(node.id, node);
    });
  }

  /**
   * Pobiera węzeł po ID
   */
  get(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Pobiera wszystkie węzły
   */
  getAll(): Node[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Pobiera węzły dla danego scenariusza
   */
  getByScenario(scenarioId: string): Node[] {
    return this.getAll().filter(node => node.scenarioId === scenarioId);
  }

  /**
   * Dodaje nowy węzeł
   */
  add(nodeData: NodeData): Node {
    const node = new Node(nodeData);
    this.nodes.set(node.id, node);
    return node;
  }

  /**
   * Aktualizuje istniejący węzeł
   */
  update(nodeId: string, data: Partial<NodeData>): Node | undefined {
    const node = this.nodes.get(nodeId);
    if (!node) return undefined;
    
    node.update(data);
    this.nodes.set(nodeId, node);
    return node;
  }

  /**
   * Usuwa węzeł
   */
  remove(nodeId: string): boolean {
    return this.nodes.delete(nodeId);
  }

  /**
   * Czyści kolekcję
   */
  clear(): void {
    this.nodes.clear();
  }

  /**
   * Konwertuje kolekcję do tablicy
   */
  toArray(): Node[] {
    return this.getAll();
  }
}