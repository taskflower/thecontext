// src/core/utils/pathHelpers.ts
export function getPath(obj: any, path: string | undefined | null): any {
  if (path == null || path === "") {
    return obj;
  }
  return path
    .split(".")
    .reduce((o, key) => (o != null ? o[key] : undefined), obj);
}

export function setPath(
  obj: any,
  path: string | undefined | null,
  value: any
): any {
  if (path == null || path === "") {
    return obj;
  }
  const keys = path.split(".");
  const last = keys.pop()!;
  let cur = obj;
  for (const key of keys) {
    if (cur[key] == null || typeof cur[key] !== "object") {
      cur[key] = {};
    }
    cur = cur[key];
  }
  cur[last] = value;
  return obj;
}
