export function getValueByPath(obj: Record<string, any>, path: string): any {
  if (!obj || !path) return null;

  const keys = path.split(".");
  return keys.reduce((acc, key) => {
    if (acc === null || acc === undefined) return null;
    return acc[key];
  }, obj);
}

export function setValueByPath(
  obj: Record<string, any>,
  path: string,
  value: any
): Record<string, any> {
  if (!obj || !path) return obj;

  const keys = path.split(".");
  let newObj = { ...obj };
  let current = newObj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = current[key] ? { ...current[key] } : {};
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return newObj;
}

export function pathExists(obj: Record<string, any>, path: string): boolean {
  if (!obj || !path) return false;

  const value = getValueByPath(obj, path);
  return value !== undefined && value !== null;
}

export function normalizePath(path: string): string {
  if (!path) return "";
  return path
    .split(".")
    .filter((part) => part.trim() !== "")
    .join(".");
}
