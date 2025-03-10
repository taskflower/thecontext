/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/types.ts
import { Step, ConversationItem } from "@/types";

export interface ViewerProps {
  step: Step;
  onComplete: (result?: Record<string, any>, conversationData?: ConversationItem[]) => void;
}

export interface EditorProps {
  step: Step;
  onChange: (updates: Partial<Step>) => void;
}

export interface ResultRendererProps {
  step: Step;
}

export interface StepPlugin {
  type: string;
  name: string;
  Viewer: React.ComponentType<ViewerProps>;
  Editor: React.ComponentType<EditorProps>;
  ResultRenderer: React.ComponentType<ResultRendererProps>;
  defaultConfig: Record<string, any>;
  category: string;
  description: string;
}