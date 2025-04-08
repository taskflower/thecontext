// src/models/NodeCollection.ts
import { Node } from './Node';
import { NodeData } from '../types';

export class NodeCollection {
  private nodes: Map<string, Node> = new Map();

  constructor(nodesData: NodeData[] = []) {
    nodesData.forEach(nodeData => {
      const node = new Node(nodeData);
      this.nodes.set(node.id, node);
    });
  }

  get(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  getAll(): Node[] {
    return Array.from(this.nodes.values());
  }

  getByScenario(scenarioId: string): Node[] {
    return this.getAll().filter(node => node.scenarioId === scenarioId);
  }

  add(nodeData: NodeData): Node {
    const node = new Node(nodeData);
    this.nodes.set(node.id, node);
    return node;
  }

  update(nodeId: string, data: Partial<NodeData>): Node | undefined {
    const node = this.nodes.get(nodeId);
    if (!node) return undefined;
    
    node.update(data);
    this.nodes.set(nodeId, node);
    return node;
  }

  remove(nodeId: string): boolean {
    return this.nodes.delete(nodeId);
  }

  clear(): void {
    this.nodes.clear();
  }

  toArray(): Node[] {
    return this.getAll();
  }
}