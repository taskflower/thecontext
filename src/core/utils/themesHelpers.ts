import type { AppConfig } from "@/core";

export function getScenarioCounts(config: AppConfig): Record<string, number> {
  const counts: Record<string, number> = {};
  if (config.scenarios) {
    config.scenarios.forEach((scenario) => {
      if (scenario.workspaceSlug) {
        counts[scenario.workspaceSlug] = (counts[scenario.workspaceSlug] || 0) + 1;
      }
    });
  }
  return counts;
}


export const getColSpanClass = (colSpan?: 1 | 2 | 3 | "full") => {
  switch (colSpan) {
    case 1:
      return "col-span-1";
    case 2:
      return "col-span-2";
    case 3:
      return "col-span-3";
    case "full":
      return "col-span-full";
    default:
      return "col-span-1";
  }
};
