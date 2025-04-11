// src/templates/default/index.ts
import {
  BaseTemplate,
  BaseTemplateConfig,
  BaseWorkspaceData,
} from "../baseTemplate";

import { getTemplateConfig } from './config/templateConfig';
import { getDefaultWorkspaceData } from './data/workspaceData';

export class DefaultTemplate extends BaseTemplate {
  readonly id = "default";
  readonly name = "Default Template";
  readonly description = "The standard template with a clean, modern design";
  readonly version = "1.0.0";
  readonly author = "Application Team";

  getConfig(): BaseTemplateConfig {
    return getTemplateConfig({
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
    });
  }

  getDefaultWorkspaceData(): BaseWorkspaceData {
    return getDefaultWorkspaceData();
  }
}