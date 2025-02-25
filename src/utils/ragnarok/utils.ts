/* eslint-disable @typescript-eslint/no-explicit-any */

import { IContainer, IContainerDocument, IContainerRelation, IDocumentSchema } from "./types";

  
  // ID generator
  export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  // Container Manager
  export class ContainerManager {
    /**
     * Validates if a document conforms to a schema
     */
    validateSchema(doc: IContainerDocument, schema: IDocumentSchema): boolean {
      return schema.fields.every(field => {
        if (field.required) {
          return doc.customFields[field.name] !== undefined;
        }
        return true;
      });
    }
    
    /**
     * Validates if a relation is valid between containers
     */
    validateRelation(relation: IContainerRelation, containers: IContainer[]): boolean {
      const sourceContainer = containers.find(c => c.id === relation.sourceContainerId);
      const targetContainer = containers.find(c => c.id === relation.targetContainerId);
      
      if (!sourceContainer || !targetContainer) return false;
      
      // Find schemas for both containers
      const sourceDoc = sourceContainer.documents.find(d => 
        sourceContainer.schemas.some(s => s.id === d.schemaId)
      );
      const targetDoc = targetContainer.documents.find(d => 
        targetContainer.schemas.some(s => s.id === d.schemaId)
      );
      
      if (!sourceDoc || !targetDoc) return false;
      
      // Check if fields exist in schemas
      const sourceSchema = sourceContainer.schemas.find(s => s.id === sourceDoc.schemaId);
      const targetSchema = targetContainer.schemas.find(s => s.id === targetDoc.schemaId);
      
      if (!sourceSchema || !targetSchema) return false;
      
      const sourceHasField = sourceSchema.fields.some(f => f.name === relation.sourceField);
      const targetHasField = targetSchema.fields.some(f => f.name === relation.targetField);
      
      return sourceHasField && targetHasField;
    }
    
    /**
     * Filters documents based on relation conditions
     */
    filterDocumentsByRelation(
      relation: IContainerRelation,
      containers: IContainer[]
    ): IContainerDocument[] {
      const sourceContainer = containers.find(c => c.id === relation.sourceContainerId);
      const targetContainer = containers.find(c => c.id === relation.targetContainerId);
      
      if (!sourceContainer || !targetContainer) return [];
      
      return sourceContainer.documents.filter(sourceDoc => {
        return targetContainer.documents.some(targetDoc => {
          const sourceValue = sourceDoc.customFields[relation.sourceField];
          const targetValue = targetDoc.customFields[relation.targetField];
          
          switch (relation.condition) {
            case 'equals':
              return sourceValue === targetValue;
            case 'greater':
              return sourceValue > targetValue;
            case 'less':
              return sourceValue < targetValue;
            case 'contains':
              return String(sourceValue).includes(String(targetValue));
            default:
              return false;
          }
        });
      });
    }
    
    /**
     * Extracts document content for LLM context
     */
    getDocumentsContentForLLM(documents: IContainerDocument[]): string {
      return documents.map(doc => {
        return `# ${doc.title}\n${doc.content}`;
      }).join('\n\n');
    }
    
    /**
     * Formats document metadata for LLM context
     */
    getDocumentsMetadataForLLM(documents: IContainerDocument[]): string {
      return documents.map(doc => {
        const fields = Object.entries(doc.customFields)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
          
        return `Document "${doc.title}" (ID: ${doc.id}) - Fields: ${fields}`;
      }).join('\n');
    }
  }
  
  // RAG Utilities
  export class RAGUtils {
    /**
     * Prepares a context string from documents for LLM prompt
     */
    static prepareContextFromDocuments(documents: IContainerDocument[]): string {
      if (!documents || documents.length === 0) {
        return "No documents available for context.";
      }
      
      const containerManager = new ContainerManager();
      const contentText = containerManager.getDocumentsContentForLLM(documents);
      
      return `CONTEXT FROM DOCUMENTS:\n${contentText}\n\nEND OF CONTEXT`;
    }
    
    /**
     * Formats a task and its related documents for LLM prompt
     */
    static formatTaskForLLM(task: any, documents: IContainerDocument[]): string {
      const context = this.prepareContextFromDocuments(documents);
      
      const taskInfo = `
  TASK INFORMATION:
  Title: ${task.title}
  Description: ${task.description}
  Status: ${task.status}
  Priority: ${task.priority}
  Steps:
  ${task.steps.map((step: any) => `- ${step.type}: ${step.description}`).join('\n')}
  `;
      
      return `${taskInfo}\n\n${context}`;
    }
    
    /**
     * Creates a message with task instructions for an LLM
     */
    static createLLMPromptForTask(task: any, step: any, documents: IContainerDocument[]): string {
      const context = this.prepareContextFromDocuments(documents);
      let instruction = "";
      
      switch(step.type) {
        case 'retrieval':
          instruction = "Please analyze the documents and identify the most relevant information for this task.";
          break;
        case 'processing':
          instruction = "Please process and analyze the information in these documents to extract key insights.";
          break;
        case 'generation':
          instruction = "Based on the provided documents, please generate a new document that summarizes the key information.";
          break;
        case 'validation':
          instruction = "Please verify the accuracy and completeness of the information in these documents.";
          break;
        default:
          instruction = "Please complete the task step based on the provided context.";
      }
      
      return `
  TASK: ${task.title}
  STEP: ${step.description} (${step.type})
  INSTRUCTION: ${instruction}
  
  ${context}
  
  Please provide your response in a clear, structured format.
  `;
    }
  }