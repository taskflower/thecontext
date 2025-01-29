// src/types/template.ts
export type StepData = {
    question: string;
    answer: string;
    confirmed?: boolean;
    role?: string;
  };
  
  export type Step = {
    id: string;
    name: string;
    description: string;
    pluginId: string;
    data: StepData;
  };
  
  export interface Template {
    id: string;
    name: string;
    description?: string;
    steps: {
      id: string;
      name: string;
      description?: string;
      pluginId: string;
      data: StepData;
    }[];
  }
  