// src/utils/documents/index.ts
export * from './fieldUtils';
export * from './containerUtils';
export * from './relationUtils';
export * from './documentUtils';
export * from './autoRelationUtils';
export * from './validation';

// Explicitly re-export types and specific functions
export type { UpdateDocumentResult } from './fieldUtils';
export { initializeDocument } from './fieldUtils';
