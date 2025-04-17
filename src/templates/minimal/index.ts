// src/templates/minimal/index.ts
import { Template, LayoutTemplate, WidgetTemplate, FlowStepTemplate, Workspace } from "../baseTemplate";
import { getLayoutsConfig } from "./layouts";
import { getFlowStepsConfig } from "./flowSteps";
import { workspaces } from "./workspaces";

export class MinimalTemplate implements Template {
  readonly id = "minimal";
  readonly name = "Minimal Template";
  readonly description = "Demonstracyjny, minimalny szablon z formami i LLM";
  readonly version = "0.1.0";
  readonly author = "Demo Team";

  getLayouts(): LayoutTemplate[] {
    return getLayoutsConfig();
  }

  getWidgets(): WidgetTemplate[] {
    return [];
  }

  getFlowSteps(): FlowStepTemplate[] {
    return getFlowStepsConfig();
  }

  getWorkspaces(): Workspace[] {
    return workspaces;
  }
}