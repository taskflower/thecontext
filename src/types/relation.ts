// types/relation.ts

export type RelationType = 'OneToOne' | 'OneToMany';

export type MatchType = 'exact' | 'contains' | 'startsWith' | 'endsWith';

export interface RelationRule {
  sourceField: string;
  targetField: string;
  matchType: MatchType;
}

export interface RelationConfig {
  id: string;
  sourceContainerId: string;
  targetContainerId: string;
  type: RelationType;
  name: string;
  description?: string;
  rules: RelationRule[];
}

export interface DocumentRelation {
  id: string;
  sourceDocumentId: string;
  sourceContainerId: string;
  targetDocumentId: string;
  targetContainerId: string;
  configId: string;
  createdAt: Date;
}
