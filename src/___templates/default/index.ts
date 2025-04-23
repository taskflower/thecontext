// src/templates/default/index.ts
import { Template } from '../baseTemplate';
import { getLayoutsConfig } from './layouts';
import { getWidgetsConfig } from './widgets';
import { getFlowStepsConfig } from './flowSteps';
import { workspaces } from './workspaces';

export class DefaultTemplate implements Template {
  readonly id = "default";
  readonly name = "Default Template";
  readonly description = "The standard template with a clean, modern design";
  readonly version = "1.0.0";
  readonly author = "Application Team";

  getLayouts() {
    return getLayoutsConfig();
  }

  getWidgets() {
    return getWidgetsConfig();
  }

  getFlowSteps() {
    return getFlowStepsConfig();
  }

  getWorkspaces() {
    return workspaces;
  }
}