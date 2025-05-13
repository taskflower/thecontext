// src/core/utils/jsonToZod.ts
import { z, ZodTypeAny } from "zod";

// Globalna mapa cache dla obiektów Zod - ta sama instancja schematu JSON
// zawsze zostanie zmapowana na tę samą instancję schematu Zod
const zodCache = new WeakMap<any, ZodTypeAny>();

export function jsonToZod(schema: any): ZodTypeAny {
  // Obsługa przypadków podstawowych
  if (!schema || typeof schema !== "object") {
    return z.any();
  }
  
  // Sprawdzenie czy schemat jest już w cache
  const fromCache = zodCache.get(schema);
  if (fromCache) {
    return fromCache;
  }

  let result: ZodTypeAny;
  
  switch (schema.type) {
    case "string":
      result = z.string();
      break;
    case "number":
      result = z.number();
      break;
    case "boolean":
      result = z.boolean();
      break;
    case "array":
      // Rekurencyjne tworzenie schematu elementów tablicy
      result = z.array(schema.items ? jsonToZod(schema.items) : z.any());
      break;
    case "object":
      const props: Record<string, ZodTypeAny> = {};
      
      // Przetwarzanie właściwości obiektu
      for (const key in schema.properties || {}) {
        props[key] = jsonToZod(schema.properties[key]);
      }
      
      let obj = z.object(props);
      
      // Obsługa wymaganych pól
      if (Array.isArray(schema.required)) {
        const req: Record<string, ZodTypeAny> = {};
        for (const key of schema.required) {
          req[key] = props[key];
        }
        obj = obj.extend(req);
      }
      
      result = obj;
      break;
    default:
      result = z.any();
  }

  // Dodanie wyniku do cache przed zwróceniem
  zodCache.set(schema, result);
  return result;
}