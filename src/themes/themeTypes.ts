import { ZodType } from "zod";
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
  context?: {
    stepIdx?: number;
    totalSteps?: number;
    workspace?: any;
    scenario?: any;
  };
}

export type LlmStepProps<T> = {
  schema: ZodType<T>;
  jsonSchema?: any;
  data?: T;
  onSubmit: (data: T) => void;
  userMessage: string;
  systemMessage?: string;
  showResults?: boolean;
  autoStart?: boolean;
  apiEndpoint?: string;
  title?: string;
  description?: string;
};

export type ErrorStepProps = {
  error?: string;
  componentName?: string;
  onSubmit: (data: any) => void;
};