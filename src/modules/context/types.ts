/**
 * Context Management Types
 * Types for the context management system
 */

// Content type enum (for proper rendering and editing)
export enum ContextContentType {
  TEXT = 'text/plain',
  JSON = 'application/json',
  MARKDOWN = 'text/markdown',
  HTML = 'text/html',
  XML = 'application/xml',
  YAML = 'application/yaml',
  CSV = 'text/csv'
}

// Visibility settings for context items
export enum ContextVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  WORKSPACE = 'workspace'
}

// Schema status (whether the item has a defined schema)
export enum SchemaStatus {
  NONE = 'none',
  SIMPLE = 'simple',   // Basic type validation
  COMPLEX = 'complex'  // Full JSON schema
}

// Context Item interface
export interface ContextItem {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  content: string;
  contentType: ContextContentType;
  visibility: ContextVisibility;
  schemaStatus: SchemaStatus;
  schema?: string;     // JSON Schema as string, if applicable
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  metadata?: Record<string, any>;
}

// Create context item params
export interface CreateContextItemParams {
  workspaceId: string;
  title: string;
  description?: string;
  content: string;
  contentType: ContextContentType;
  visibility?: ContextVisibility;
  schemaStatus?: SchemaStatus;
  schema?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Update context item params
export interface UpdateContextItemParams {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  contentType?: ContextContentType;
  visibility?: ContextVisibility;
  schemaStatus?: SchemaStatus;
  schema?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Context validation result
export interface ContextValidationResult {
  isValid: boolean;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

// Context search/filter params
export interface ContextFilterParams {
  workspaceId?: string;
  contentType?: ContextContentType;
  visibility?: ContextVisibility;
  schemaStatus?: SchemaStatus;
  tags?: string[];
  query?: string; // Search in title, description, content
}

// Context store state
export interface ContextState {
  items: Record<string, ContextItem>;
  isLoading: boolean;
  error: string | null;
  currentItemId: string | null;
}

// Context serialization for import/export
export interface ContextExport {
  version: string;
  exportedAt: string;
  items: ContextItem[];
}

// Context import result
export interface ContextImportResult {
  success: boolean;
  importedCount: number;
  errors: Array<{
    itemId?: string;
    message: string;
  }>;
  importedIds: string[];
}