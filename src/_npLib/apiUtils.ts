// lib/apiUtils.ts
import { z, ZodType } from "zod";

/**
 * Wyodrębnia JSON z treści odpowiedzi LLM
 */
export function extractJsonFromContent(content: string): any {
  const match = /```json\s*([\s\S]*?)\s*```/m.exec(content);
  const data = match?.[1] ?? content;
  try {
    return JSON.parse(data.trim());
  } catch {
    return { content };
  }
}

/**
 * Tworzy schemat Zod na podstawie obiektu JSON
 */
export function createZodSchema(obj: any): ZodType<any> {
  if (Array.isArray(obj)) {
    return z.array(obj.length ? createZodSchema(obj[0]) : z.any());
  }
  if (obj && typeof obj === 'object') {
    return z.object(
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, createZodSchema(v)])
      )
    );
  }
  if (typeof obj === 'string') return z.string();
  if (typeof obj === 'number') return z.number();
  if (typeof obj === 'boolean') return z.boolean();
  return z.any();
}

/**
 * Przetwarza odpowiedź z API LLM, wyodrębnia JSON i waliduje go
 */
export function processLlmResponse(apiResponse: any, schema?: any): any {
  const content = apiResponse?.success && apiResponse?.data?.message?.content;
  if (!content) {
    console.error('Invalid API response format');
    return null;
  }
  const data = extractJsonFromContent(content);
  if (!schema || data == null) return data;
  try {
    const result = createZodSchema(schema).safeParse(data);
    if (result.success) return result.data;
    console.error(
      'Validation errors:',
      result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
    );
    return { ...data, _validationErrors: result.error.errors };
  } catch (e) {
    console.error('Validation error:', e);
    return data;
  }
}
