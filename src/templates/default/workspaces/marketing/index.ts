// src/templates/default/workspaces/marketing/index.ts

import { scenarios } from './scenarios';
import { initialContext } from './context';
import { schemas } from './schemas';
import { Workspace } from '@/templates/baseTemplate';

// Uzupełnij schematy w kontekście
const contextWithSchemas = {
  ...initialContext,
  schemas
};

export const marketingWorkspace: Workspace = {
  id: "workspace-1",
  name: "Marketing Facebook",
  description: "Workspace do analizy marketingowej stron internetowych i wdrażania kampanii Facebook",
  templateSettings: {
    layoutTemplate: "default",
    scenarioWidgetTemplate: "card-list",
    defaultFlowStepTemplate: "basic-step",
    theme: "light",
  },
  getScenarios: () => scenarios,
  getInitialContext: () => contextWithSchemas
};