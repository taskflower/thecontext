/* eslint-disable @typescript-eslint/no-explicit-any */
// responseParser.ts
export function getValueByPath(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) return undefined;
      current = current[key];
    }
    
    return current;
  }