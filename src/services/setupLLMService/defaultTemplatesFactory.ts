// src/services/setupLLMService/defaultTemplatesFactory.ts
import { 
  IGeneratedSetup, 
  Priority, 
  StepType, 
  Container, 
  Template, 
  Task 
} from "./types";

export type ProjectType = 'marketing' | 'research' | 'general';

export class DefaultTemplatesFactory {
  static determineProjectType(intent: string): ProjectType {
    const intentLower = intent.toLowerCase();
    
    if (intentLower.includes('marketing')) return 'marketing';
    if (intentLower.includes('research')) return 'research';
    return 'general';
  }

  static createDefaultSetup(projectName: string, intent: string): IGeneratedSetup {
    const projectType = this.determineProjectType(intent);
    
    return {
      projectName,
      containers: this.getDefaultContainers(projectType),
      templates: [this.getDefaultTemplate(projectType)],
      initialTask: this.getDefaultInitialTask(projectName, projectType)
    };
  }

  static getDefaultContainers(type: ProjectType): Container[] {
    const containerMap = {
      marketing: "Marketing Materials",
      research: "Research Documents",
      general: "Project Documents"
    };

    const secondaryContainerMap = {
      marketing: "Campaign Assets",
      research: "Data Analysis",
      general: "Resources"
    };

    return [
      {
        name: containerMap[type],
        documents: [
          {
            title: "Getting Started",
            content: "This is an automatically generated document to help you get started with your project."
          }
        ]
      },
      {
        name: secondaryContainerMap[type]
      }
    ];
  }

  static getDefaultTemplate(type: ProjectType): Template {
    const templateMap = {
      marketing: "Marketing Campaign",
      research: "Research Analysis",
      general: "Standard Workflow"
    };

    const descriptionMap = {
      marketing: "creating marketing campaigns",
      research: "conducting research analysis",
      general: "processing project documents"
    };

    return {
      name: templateMap[type],
      description: `Template for ${descriptionMap[type]}`,
      defaultPriority: "medium" as Priority,
      defaultSteps: [
        { order: 1, type: "retrieval" as StepType, description: "Gather relevant information" },
        { order: 2, type: "processing" as StepType, description: "Analyze gathered information" },
        { order: 3, type: "generation" as StepType, description: "Create output document" },
        { order: 4, type: "validation" as StepType, description: "Validate results" }
      ]
    };
  }

  static getDefaultInitialTask(projectName: string, type: ProjectType): Task {
    const titleMap = {
      marketing: "Create Marketing Strategy",
      research: "Initial Research Analysis",
      general: "Project Initialization"
    };

    return {
      title: titleMap[type],
      description: `Get started with your ${projectName} project.`,
      priority: "high" as Priority
    };
  }
}