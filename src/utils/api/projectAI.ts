// src/utils/api/projectAI.ts

import { IGeneratedSetup } from "../projects/projectTypes";


// Mock API endpoint for generation with LLM
// This would be replaced with actual API calls in a production environment
export const generateProjectSetup = async (projectName: string, projectIntent: string): Promise<IGeneratedSetup> => {
  // In a real implementation, this would call your LLM service
  // For now, we simulate a delay and return a mock response
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Extract keywords from intent to customize the response
  const containsMarketing = projectIntent.toLowerCase().includes('marketing');
  const containsResearch = projectIntent.toLowerCase().includes('research');
  const containsDocuments = projectIntent.toLowerCase().includes('document');
  
  return {
    projectName,
    containers: [
      {
        name: containsMarketing ? "Marketing Materials" : 
               containsResearch ? "Research Documents" : 
               "Project Documents",
        documents: [
          {
            title: "Sample Document",
            content: "This is a sample document to help you get started with your project."
          }
        ]
      },
      {
        name: containsMarketing ? "Campaign Assets" : 
               containsResearch ? "Data Analysis" : 
               "Resources",
      }
    ],
    templates: [
      {
        name: containsMarketing ? "Marketing Campaign" : 
              containsResearch ? "Research Analysis" : 
              "Standard Workflow",
        description: `Template for ${containsMarketing ? "creating marketing campaigns" : 
                                   containsResearch ? "conducting research analysis" : 
                                   "processing project documents"}`,
        defaultPriority: "medium",
        defaultSteps: [
          { order: 1, type: "retrieval", description: "Gather relevant information" },
          { order: 2, type: "processing", description: "Analyze gathered information" },
          { order: 3, type: "generation", description: "Create output document" },
          { order: 4, type: "validation", description: "Validate results" }
        ]
      }
    ],
    initialTask: {
      title: containsMarketing ? "Create Marketing Strategy" : 
             containsResearch ? "Initial Research Analysis" : 
             "Project Initialization",
      description: `This task will help you get started with your ${projectName} project.`,
      priority: "high"
    }
  };
};

// Function to suggest related documents for a task based on task description and project context
export const suggestRelatedDocuments = async (
  taskDescription: string,
  projectId: string,
  availableDocumentIds: string[]
): Promise<string[]> => {
  // In a real implementation, this would call your LLM service
  // For now, we return a random selection of document IDs
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock implementation - randomly select up to 3 documents
  return availableDocumentIds
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(3, availableDocumentIds.length));
};

// Function to suggest next steps for a project based on current progress
export const suggestNextSteps = async (
  projectId: string,
  completedTasks: number,
  pendingTasks: number
): Promise<string[]> => {
  // In a real implementation, this would call your LLM service
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (completedTasks === 0 && pendingTasks === 0) {
    return [
      "Create your first task to get started",
      "Add documents to your project containers",
      "Explore available task templates"
    ];
  } else if (completedTasks > 0 && pendingTasks === 0) {
    return [
      "All tasks completed! Create new tasks to continue progress",
      "Review completed tasks for insights",
      "Consider creating a report from your project data"
    ];
  } else {
    return [
      "Continue working on pending tasks",
      "Prioritize tasks by importance",
      "Check for any bottlenecks in your workflow"
    ];
  }
};

// Function to generate a project report based on completed tasks and documents
export const generateProjectReport = async (
  projectId: string,
  projectName: string,
  taskSummaries: string[],
  documentCount: number
): Promise<string> => {
  // In a real implementation, this would call your LLM service
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return `# ${projectName} - Project Report
  
## Summary
This project contains ${documentCount} documents and ${taskSummaries.length} completed tasks.

## Task Outcomes
${taskSummaries.map((summary, index) => `${index + 1}. ${summary}`).join('\n')}

## Recommendations
- Consider organizing documents into more specific categories
- Review task templates for optimization opportunities
- Share project outcomes with stakeholders

Report generated on ${new Date().toLocaleDateString()}
`;
};