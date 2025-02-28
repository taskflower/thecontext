/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/types.ts
import { Step } from "@/types";

export interface ViewerProps {
  step: Step;
  onComplete: (result?: Record<string, any>) => void;
}

export interface EditorProps {
  step: Step;
  onChange: (updates: Partial<Step>) => void;
}

export interface StepPlugin {
  type: string;
  name: string;
  Viewer: React.ComponentType<ViewerProps>;
  Editor: React.ComponentType<EditorProps>;
  defaultConfig: Record<string, any>;
}