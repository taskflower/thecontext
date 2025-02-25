// src/types/relation.ts
export interface DocumentRelation {
  id: string;
  sourceDocumentId: string;
  sourceContainerId: string;
  targetDocumentId: string;
  targetContainerId: string;
  configId: string;
  createdAt: Date;
}

export interface RelationConfig {
  id: string;
  name: string;
  description?: string;
  type: RelationType;
  sourceContainerId: string;
  targetContainerId: string;
  rules: RelationRule[];
}

export type RelationType = 'OneToOne' | 'OneToMany' | 'ManyToMany';

export interface RelationRule {
  sourceField: string;
  targetField: string;
  matchType: MatchType;
}

export type MatchType = 'exact' | 'contains' | 'startsWith' | 'endsWith';