// ----------------------------------------
// src/core/hooks/getAvailableThemes.ts
export const getAvailableThemes = (): string[] => {
  const themes = new Set<string>();
  Object.keys(
    import.meta.glob("../themes/**/!(*.d).{tsx,jsx}", { eager: false })
  ).forEach((path) => {
    const match = path.match(/\.\.\/themes\/([^\/]+)\//);
    if (match) themes.add(match[1]);
  });
  return Array.from(themes);
};
