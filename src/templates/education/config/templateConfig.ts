// src/templates/education/config/templateConfig.ts
import { BaseTemplateConfig } from "../../baseTemplate";
import { getLayoutsConfig } from './layouts';
import { getWidgetsConfig } from './widgets';
import { getFlowStepsConfig } from './flowSteps';

interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
}

export function getTemplateConfig(metadata: TemplateMetadata): BaseTemplateConfig {
  return {
    id: metadata.id,
    name: metadata.name,
    description: metadata.description,
    version: metadata.version,
    author: metadata.author,
    layouts: getLayoutsConfig(),
    widgets: getWidgetsConfig(),
    flowSteps: getFlowStepsConfig(),
  };
}