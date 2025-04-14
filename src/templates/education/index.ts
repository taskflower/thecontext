// src/templates/education/index.ts
import {
    BaseTemplate,
    BaseTemplateConfig,
    BaseWorkspaceData,
  } from "../baseTemplate";
  
  import { getTemplateConfig } from './config/templateConfig';
  import { getEducationWorkspaceData } from './data/workspaceData';
  
  export class EducationTemplate extends BaseTemplate {
    readonly id = "education";
    readonly name = "EduSprint";
    readonly description = "Szablon dla aplikacji edukacyjnych wspierających uczniów szkół średnich";
    readonly version = "1.0.0";
    readonly author = "Education Team";
  
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
      return getEducationWorkspaceData();
    }
  }