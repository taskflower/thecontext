// src/utils/responseExtractor.ts
import { extractJsonFromContent } from './data';

/**
 * Types of content that can be extracted from LLM responses
 */
export enum ResponseContentType {
  JSON = 'json',
  CODE = 'code',
  TEXT = 'text',
}

/**
 * Result of content extraction
 */
export interface ExtractedContent {
  type: ResponseContentType;
  content: any;
  originalText: string;
  formattedContent?: string;
}

/**
 * Extracts various types of content from LLM responses
 * @param response The LLM response text
 * @param expectedFormat Expected format (optional)
 * @returns Extracted content with type information
 */
export function extractContent(
  response: string,
  expectedFormat?: ResponseContentType
): ExtractedContent {
  if (!response) {
    return {
      type: ResponseContentType.TEXT,
      content: null,
      originalText: '',
    };
  }

  // First try to extract JSON if that's what we expect
  if (!expectedFormat || expectedFormat === ResponseContentType.JSON) {
    const jsonData = extractJsonFromContent(response);
    if (jsonData) {
      return {
        type: ResponseContentType.JSON,
        content: jsonData,
        originalText: response,
        formattedContent: JSON.stringify(jsonData, null, 2),
      };
    }
  }

  // Look for code blocks
  const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/g;
  const codeBlocks = [];
  let match;
  
  while ((match = codeBlockRegex.exec(response)) !== null) {
    codeBlocks.push(match[1].trim());
  }

  if (codeBlocks.length > 0) {
    // If we have code blocks, return the first or all of them
    const codeContent = codeBlocks.length === 1 ? codeBlocks[0] : codeBlocks;
    return {
      type: ResponseContentType.CODE,
      content: codeContent,
      originalText: response,
      formattedContent: typeof codeContent === 'string' 
        ? codeContent 
        : codeContent.join('\n\n'),
    };
  }

  // If no structured content was found, return the text as is
  return {
    type: ResponseContentType.TEXT,
    content: response,
    originalText: response,
    formattedContent: response,
  };
}

/**
 * Processes LLM response based on expected schema
 * @param response Raw LLM response
 * @param schema Expected schema
 * @returns Processed response data
 */
export function processLlmResponse(response: string, schema: any): any {
  try {
    // Try to extract content
    const extracted = extractContent(response);
    
    // If we got JSON, use it directly
    if (extracted.type === ResponseContentType.JSON) {
      return extracted.content;
    }
    
    // If we have a code sample but need JSON, try to infer JSON from the code
    if (extracted.type === ResponseContentType.CODE) {
      // For TypeScript/JavaScript, try to extract object literals
      const objectLiteralRegex = /(?:const|let|var)\s+(\w+)\s*=\s*({[\s\S]*?});/g;
      const matches = Array.from(extracted.formattedContent?.matchAll(objectLiteralRegex) || []);
      
      if (matches.length > 0) {
        // Find the most relevant object based on schema keys if available
        if (schema && typeof schema === 'object') {
          const schemaKeys = Object.keys(schema);
          for (const match of matches) {
            try {
              // Replace single quotes with double quotes for JSON parsing
              const objectStr = match[2].replace(/'/g, '"');
              const obj = JSON.parse(objectStr);
              
              // Check if object has keys that match our schema
              const matchingKeys = schemaKeys.filter(key => key in obj);
              if (matchingKeys.length > 0) {
                return obj;
              }
            } catch (e) {
              console.warn('Failed to parse object literal:', e);
            }
          }
        }
      }
    }
    
    // If we couldn't extract structured data but have schema, create placeholder
    if (schema) {
      // Create placeholder data based on schema
      return createPlaceholderFromSchema(schema);
    }
    
    // As a last resort, return the original content
    return {
      rawContent: extracted.originalText,
      processingStatus: 'unstructured',
      type: extracted.type
    };
  } catch (e) {
    console.error('Error processing LLM response:', e);
    return null;
  }
}

/**
 * Creates placeholder data based on schema
 * @param schema Schema object
 * @returns Placeholder data object
 */
function createPlaceholderFromSchema(schema: any): any {
  if (!schema) return {};
  
  if (Array.isArray(schema)) {
    // For form field schema
    const result: Record<string, any> = {};
    schema.forEach(field => {
      if (field.name) {
        result[field.name] = getDefaultValueForType(field.type);
      }
    });
    return result;
  }
  
  // For object schemas
  const result: Record<string, any> = {};
  
  Object.entries(schema).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      if ('type' in value) {
        result[key] = getDefaultValueForType(value.type);
      } else {
        result[key] = createPlaceholderFromSchema(value);
      }
    } else {
      result[key] = null;
    }
  });
  
  return result;
}

/**
 * Returns default value for a type
 * @param type Type name
 * @returns Default value
 */
function getDefaultValueForType(type: string): any {
  switch (type) {
    case 'string':
      return '[Placeholder text]';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}