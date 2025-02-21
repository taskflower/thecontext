// types/relation.ts
export type RelationType = 'OneToOne' | 'OneToMany';

export interface RelationConfig {
  id: string;
  sourceContainerId: string;
  targetContainerId: string;
  type: RelationType;
  name: string;
  description?: string;
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