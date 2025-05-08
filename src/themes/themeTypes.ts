export type WidgetConfig = {
  tplFile: string;
  title?: string;
  contextDataPath?: string;
  colSpan?: 1 | 2 | 3 | "full";
  [key: string]: any;
};

export interface WidgetsStepProps {
  widgets: WidgetConfig[];
  onSubmit: (data: any) => void;
  title?: string;
  subtitle?: string;
  saveToDB?: {
    enabled: boolean;
    provider: "indexedDB";
    itemId?: string;
    itemType: "lesson" | "quiz" | "project";
    itemTitle?: string;
    contentPath?: string;
  } | null;
  scenarioName?: string | null;
  nodeSlug?: string | null;
}
