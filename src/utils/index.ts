// src/utils/index.ts - Zunifikowane funkcje narzędziowe
import { z, ZodType } from 'zod';

// =================== OPERACJE NA ŚCIEŻKACH ===================

/**
 * Pobiera wartość z obiektu po ścieżce dostępu
 */
export const getValueByPath = (obj: Record<string, any>, path: string): any => {
  if (!obj || !path) return undefined;
  return path
    .split('.')
    .reduce((acc, key) => {
      if (acc == null) return undefined;
      const m = key.match(/^(\w+)\[(\d+)\]$/);
      return m ? acc[m[1]]?.[+m[2]] : acc[key];
    }, obj);
};

/**
 * Ustawia wartość w obiekcie po ścieżce dostępu
 */
export function setValueByPath(
  obj: Record<string, any>,
  path: string,
  value: any
): Record<string, any> {
  if (!obj || !path) return obj;
  const keys = path.split('.');
  const result = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur:any = result;

  keys.forEach((key, i) => {
    const isLast = i === keys.length - 1;
    const m = key.match(/^(\w+)\[(\d+)\]$/);

    if (m) {
      const [, k, idxStr] = m;
      const idx = +idxStr;
      cur[k] = [...(cur[k] || [])];
      while (cur[k].length <= idx) cur[k].push(undefined);

      if (isLast) {
        cur[k][idx] = value;
      } else {
        cur[k][idx] = cur[k][idx] != null && typeof cur[k][idx] === 'object' ? { ...cur[k][idx] } : {};
        cur = cur[k][idx];
      }
    } else {
      if (isLast) {
        cur[key] = value;
      } else {
        cur[key] = cur[key] != null && typeof cur[key] === 'object' ? { ...cur[key] } : {};
        cur = cur[key];
      }
    }
  });

  return result;
}

/**
 * Sprawdza czy ścieżka istnieje w obiekcie
 */
export const pathExists = (obj: Record<string, any>, path: string): boolean =>
  getValueByPath(obj, path) != null;

/**
 * Normalizuje ścieżkę
 */
export const normalizePath = (path = ''): string =>
  path.split('.').filter(Boolean).join('.');

/**
 * Przetwarza szablon z wartościami z kontekstu
 */
export function processTemplate(
  template: string,
  ctx: Record<string, any>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, p) => {
    const v = getValueByPath(ctx, p.trim());
    return v != null ? String(v) : _;
  });
}

// =================== OPERACJE NA LIŚCIE ===================

/**
 * Aktualizuje element w liście na podstawie ID lub dodaje, jeśli nie istnieje
 */
export function updateItemInList<T extends { id: string }>(
  list: T[],
  item: T
): T[] {
  const exists = list.some(i => i.id === item.id);
  return exists ? list.map(i => i.id === item.id ? item : i) : [...list, item];
}

// =================== OBSŁUGA BŁĘDÓW ===================

/**
 * Zwraca komunikat błędu z obiektu Error lub innego typu
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === 'string' ? error : 'Unknown error occurred';
}

/**
 * Obsługa błędu API
 */
export async function handleApiError(response: Response, context: string): Promise<string> {
  const errorText = await response.text();
  console.error(`[${context}] API Error:`, errorText);
  
  try {
    const errorData = JSON.parse(errorText);
    return errorData.error?.message || `API request failed: ${response.status}`;
  } catch {
    return `API request failed: ${response.status} - ${errorText.substring(0, 100)}...`;
  }
}

// =================== OBSŁUGA LLM ===================

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