// src/pages/stepsPlugins/llmScenarioGenerator/mockData.ts

// Mock LLM response for scenario creation
export const MOCK_LLM_RESPONSE = {
    scenarios: [
      {
        id: "scenario-1",
        title: "Content Marketing Strategy",
        description: "Develop a comprehensive content strategy focusing on blog posts, social media, and email newsletters.",
        objective: "Increase organic traffic by 30% in 3 months",
        connections: ["scenario-2", "scenario-5"]
      },
      {
        id: "scenario-2",
        title: "Social Media Campaign Launch",
        description: "Create and execute targeted campaigns across Instagram, Twitter, and LinkedIn.",
        objective: "Achieve 15% engagement rate and 5000 new followers",
        connections: ["scenario-1"]
      },
      {
        id: "scenario-3",
        title: "Analytics Implementation",
        description: "Set up tracking and reporting for all marketing initiatives with custom dashboards.",
        objective: "Create real-time KPI dashboard for executive team",
        connections: ["scenario-4"]
      },
      {
        id: "scenario-4",
        title: "User Engagement Strategy",
        description: "Develop interactive content and community-building initiatives to boost retention.",
        objective: "Increase average time on site by 25%",
        connections: ["scenario-3", "scenario-5"]
      },
      {
        id: "scenario-5",
        title: "Brand Awareness Campaign",
        description: "Launch multi-channel advertising campaign to increase brand visibility.",
        objective: "Improve brand recognition metrics by 20%",
        connections: ["scenario-1", "scenario-4"]
      }
    ]
  };
  
  // Mock task templates - will be generated for each scenario
  export const TASK_TEMPLATES = [
    {
      title: "Research & Planning",
      description: "Conduct market research and create detailed project plan",
      priority: "high",
      status: "todo",
      steps: [
        {
          type: "text-input",
          title: "Define Target Audience",
          description: "Specify the primary and secondary audience segments for this project",
          config: {
            placeholder: "Describe your target audience here...",
            minLength: 50,
            multiline: true
          }
        },
        {
          type: "text-input",
          title: "Competitive Analysis",
          description: "Analyze competitors' strategies and identify opportunities",
          config: {
            placeholder: "List key competitors and their approaches...",
            minLength: 50,
            multiline: true
          }
        }
      ]
    },
    {
      title: "Content Creation",
      description: "Create the required content assets for the project",
      priority: "medium",
      status: "todo",
      steps: [
        {
          type: "text-input",
          title: "Content Brief",
          description: "Create a detailed brief for all content to be produced",
          config: {
            placeholder: "Outline the key messages, tone, and deliverables...",
            minLength: 50,
            multiline: true
          }
        },
        {
          type: "step-reference",
          title: "Reference Target Audience",
          description: "Use the target audience definition from the research phase",
          config: {
            referenceStepId: "dynamic" // Will be replaced with actual ID
          }
        }
      ]
    },
    {
      title: "Review & Launch",
      description: "Review all assets and prepare for launch",
      priority: "medium",
      status: "todo",
      steps: [
        {
          type: "text-input",
          title: "Launch Checklist",
          description: "Create a pre-launch checklist to ensure everything is ready",
          config: {
            placeholder: "List all items that must be completed before launch...",
            minLength: 20,
            multiline: true
          }
        }
      ]
    }
  ];
  
  // Each scenario gets these common steps
  export const STANDARD_STEPS = {
    "simple-plugin": {
      type: "simple-plugin",
      title: "Team Kickoff Meeting",
      description: "Schedule and conduct kickoff meeting with the project team"
    }
  };