/* eslint-disable @typescript-eslint/no-explicit-any */
import { IContainerDocument, ICustomFieldSchema, IDocumentSchema } from "@/utils/containers/types";

// src/plugins/schema/types.ts
export interface SchemaPluginView {
    displayComponent: React.ComponentType<{document: IContainerDocument}>;
    editComponent: React.ComponentType<{
      value: any;
      onChange: (value: any) => void;
      field: ICustomFieldSchema;
    }>;
  }
  
  export interface SchemaPlugin {
    id: string;
    name: string;
    schema: IDocumentSchema;
    views?: SchemaPluginView;
  }