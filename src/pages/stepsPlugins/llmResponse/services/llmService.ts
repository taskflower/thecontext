// src/pages/stepsPlugins/llmWizard/services/llmService.ts

/**
 * Simulates an LLM API call
 * In a real implementation, this would call an actual API
 */
export async function callLLM(prompt: string, options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  } = {}): Promise<{
    content: string;
    metadata: {
      model: string;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      }
    }
  }> {
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Just return mocked responses based on the prompt content
    if (prompt.includes('scenarios')) {
      return generateScenariosResponse(prompt);
    } else if (prompt.includes('tasks')) {
      return generateTasksResponse(prompt);
    } else if (prompt.includes('steps')) {
      return generateStepsResponse(prompt);
    } else if (prompt.includes('documents')) {
      return generateDocumentsResponse(prompt);
    } else {
      return {
        content: JSON.stringify({
          response: `This is a simulated response for: "${prompt}"`,
          data: [
            { title: "Item 1", description: "Description for item 1" },
            { title: "Item 2", description: "Description for item 2" }
          ]
        }),
        metadata: {
          model: options.model || "sim-model-1",
          usage: {
            promptTokens: prompt.length / 4,
            completionTokens: 150,
            totalTokens: prompt.length / 4 + 150
          }
        }
      };
    }
  }
  
  function generateScenariosResponse(prompt: string) {
    const projectName = extractProjectName(prompt);
    
    return {
      content: JSON.stringify({
        scenarios: [
          {
            id: `scenario-${Date.now()}-1`,
            title: `${projectName} Content Strategy`,
            description: "Develop a comprehensive content strategy tailored to target audience needs",
            progress: 0,
            tasks: 0,
            completedTasks: 0,
            dueDate: getFutureDateString(14),
            objective: "Increase audience engagement through targeted content"
          },
          {
            id: `scenario-${Date.now()}-2`,
            title: `${projectName} Social Media Campaign`,
            description: "Create and execute a social media campaign to amplify project reach",
            progress: 0,
            tasks: 0,
            completedTasks: 0,
            dueDate: getFutureDateString(21),
            objective: "Boost social media engagement by 25%"
          },
          {
            id: `scenario-${Date.now()}-3`,
            title: `${projectName} Analytics Setup`,
            description: "Implement analytics tracking to measure project performance",
            progress: 0,
            tasks: 0,
            completedTasks: 0,
            dueDate: getFutureDateString(7),
            objective: "Establish baseline metrics for measuring success"
          }
        ]
      }),
      metadata: {
        model: "sim-model-1",
        usage: {
          promptTokens: prompt.length / 4,
          completionTokens: 350,
          totalTokens: prompt.length / 4 + 350
        }
      }
    };
  }
  
  function generateTasksResponse(prompt: string) {
    const scenarioTitle = extractScenarioTitle(prompt);
    
    return {
      content: JSON.stringify({
        tasks: [
          {
            id: `task-${Date.now()}-1`,
            title: `Research for ${scenarioTitle}`,
            description: "Gather competitive intelligence and audience insights",
            status: "todo",
            priority: "high",
            dueDate: getFutureDateString(3)
          },
          {
            id: `task-${Date.now()}-2`,
            title: `Draft ${scenarioTitle} plan`,
            description: "Create detailed implementation plan with timelines",
            status: "todo",
            priority: "medium",
            dueDate: getFutureDateString(5)
          },
          {
            id: `task-${Date.now()}-3`,
            title: `Review ${scenarioTitle}`,
            description: "Conduct stakeholder review and gather feedback",
            status: "todo",
            priority: "medium",
            dueDate: getFutureDateString(7)
          },
          {
            id: `task-${Date.now()}-4`,
            title: `Implement ${scenarioTitle}`,
            description: "Execute the plan and track progress",
            status: "todo",
            priority: "high",
            dueDate: getFutureDateString(10)
          }
        ]
      }),
      metadata: {
        model: "sim-model-1",
        usage: {
          promptTokens: prompt.length / 4,
          completionTokens: 300,
          totalTokens: prompt.length / 4 + 300
        }
      }
    };
  }
  
  function generateStepsResponse(prompt: string) {
    const taskTitle = extractTaskTitle(prompt);
    
    return {
      content: JSON.stringify({
        steps: [
          {
            title: `Initial plan for ${taskTitle}`,
            description: "Define scope and requirements",
            type: "text-input",
            config: {
              title: "Define Requirements",
              description: "List the key requirements for this step",
              placeholder: "Enter the requirements here...",
              multiline: true
            }
          },
          {
            title: `Generate content for ${taskTitle}`,
            description: "Use AI to generate content",
            type: "llm-response",
            config: {
              title: "AI Content Generation",
              description: "Generate content using AI",
              promptTemplate: "Create content for {{taskTitle}} with focus on {{objective}}",
              mockResponse: true,
              responseSampleType: "json",
              responseSample: `{
    "title": "Generated Content for ${taskTitle}",
    "sections": [
      {"heading": "Introduction", "content": "This is the introduction section"},
      {"heading": "Main Points", "content": "These are the main points to consider"},
      {"heading": "Conclusion", "content": "This is the conclusion of the document"}
    ]
  }`
            }
          },
          {
            title: `Review ${taskTitle}`,
            description: "Review and approve the content",
            type: "simple-plugin",
            config: {
              title: "Content Review",
              description: "Review and approve the generated content"
            }
          }
        ]
      }),
      metadata: {
        model: "sim-model-1",
        usage: {
          promptTokens: prompt.length / 4,
          completionTokens: 400,
          totalTokens: prompt.length / 4 + 400
        }
      }
    };
  }
  
  function generateDocumentsResponse(prompt: string) {
    const projectTitle = extractProjectName(prompt);
    const scenarioTitle = extractScenarioTitle(prompt);
    
    return {
      content: JSON.stringify({
        documents: [
          {
            id: `doc-${Date.now()}-1`,
            title: `${projectTitle} Overview`,
            content: `This document provides an overview of the ${projectTitle} project, including goals, timeline, and key stakeholders.`,
            metaKeys: ["overview", "project", projectTitle.toLowerCase()],
            folderId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `doc-${Date.now()}-2`,
            title: `${scenarioTitle} Guidelines`,
            content: `Guidelines for implementing the ${scenarioTitle} scenario, including best practices and standards.`,
            metaKeys: ["guidelines", scenarioTitle.toLowerCase()],
            folderId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `doc-${Date.now()}-3`,
            title: `${projectTitle} Success Metrics`,
            content: `Key performance indicators and metrics for measuring the success of the ${projectTitle} project.`,
            metaKeys: ["metrics", "kpi", projectTitle.toLowerCase()],
            folderId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }),
      metadata: {
        model: "sim-model-1",
        usage: {
          promptTokens: prompt.length / 4,
          completionTokens: 350,
          totalTokens: prompt.length / 4 + 350
        }
      }
    };
  }
  
  // Helper functions
  function extractProjectName(prompt: string): string {
    const match = prompt.match(/project: "?([^"]+)"?/i) || 
                  prompt.match(/project ([^,\.]+)/i);
    return match ? match[1].trim() : "Marketing";
  }
  
  function extractScenarioTitle(prompt: string): string {
    const match = prompt.match(/scenario "?([^"]+)"?/i) || 
                  prompt.match(/scenario: "?([^"]+)"?/i);
    return match ? match[1].trim() : "Content Strategy";
  }
  
  function extractTaskTitle(prompt: string): string {
    const match = prompt.match(/task "?([^"]+)"?/i) || 
                  prompt.match(/task: "?([^"]+)"?/i);
    return match ? match[1].trim() : "Research";
  }
  
  function getFutureDateString(daysInFuture: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysInFuture);
    return date.toISOString().split('T')[0];
  }