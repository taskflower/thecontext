// lib/byPath.ts

export const getValueByPath = (obj: Record<string, any>, path: string): any =>
  path
    ? path.split(".").reduce((acc, key) => {
        if (acc == null) return undefined;
        const m = key.match(/^(\w+)\[(\d+)\]$/);
        return m ? acc[m[1]]?.[+m[2]] : acc[key];
      }, obj)
    : undefined;

export function setValueByPath(
  obj: Record<string, any>,
  path: string,
  value: any
): Record<string, any> {
  if (!obj || !path) return obj;
  const keys = path.split(".");
  const result: any = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = result;

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
        cur[k][idx] =
          cur[k][idx] != null && typeof cur[k][idx] === "object"
            ? { ...cur[k][idx] }
            : {};
        cur = cur[k][idx];
      }
    } else {
      if (isLast) {
        cur[key] = value;
      } else {
        cur[key] =
          cur[key] != null && typeof cur[key] === "object"
            ? { ...cur[key] }
            : {};
        cur = cur[key];
      }
    }
  });

  return result;
}

export const pathExists = (obj: Record<string, any>, path: string): boolean =>
  getValueByPath(obj, path) != null;

export const normalizePath = (path = ""): string =>
  path.split(".").filter(Boolean).join(".");

export function processTemplate(
  template: string,
  ctx: Record<string, any>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, p) => {
    const v = getValueByPath(ctx, p.trim());
    return v != null ? String(v) : _;
  });
}
