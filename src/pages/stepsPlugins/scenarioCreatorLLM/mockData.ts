// src/pages/stepsPlugins/scenarioCreatorLLM/mockData.ts

// Mock LLM response for scenario creation
export const MOCK_LLM_RESPONSE = {
  scenarios: [
    {
      id: "scenario-1",
      title: "Content Strategy Development",
      description: "Create a comprehensive content plan targeting key audience segments.",
      objective: "Increase organic traffic by 30% in 3 months",
      connections: ["scenario-2", "scenario-3"]
    },
    {
      id: "scenario-2",
      title: "Social Media Campaign",
      description: "Launch coordinated campaigns across Instagram, Twitter, and LinkedIn.",
      objective: "Achieve 15% engagement rate and 5000 new followers",
      connections: ["scenario-1"]
    },
    {
      id: "scenario-3",
      title: "Analytics Implementation",
      description: "Set up tracking and reporting for all marketing initiatives.",
      objective: "Create real-time KPI dashboard for executive team",
      connections: ["scenario-1", "scenario-2"]
    }
  ],
  tasks: [
    {
      scenarioRef: "scenario-1",
      title: "Audience Research",
      description: "Conduct comprehensive research on target audience segments",
      priority: "high"
    },
    {
      scenarioRef: "scenario-1",
      title: "Content Calendar",
      description: "Develop monthly content calendar with themes and topics",
      priority: "medium"
    },
    {
      scenarioRef: "scenario-1",
      title: "Editorial Guidelines",
      description: "Create brand voice and style guidelines for content creation",
      priority: "medium"
    },
    {
      scenarioRef: "scenario-2",
      title: "Platform Audit",
      description: "Audit current social media presence and performance",
      priority: "medium"
    },
    {
      scenarioRef: "scenario-2",
      title: "Campaign Creative",
      description: "Design visual assets and copy for social media posts",
      priority: "high"
    },
    {
      scenarioRef: "scenario-2",
      title: "Engagement Strategy",
      description: "Develop plan for community management and engagement",
      priority: "low"
    },
    {
      scenarioRef: "scenario-3",
      title: "Analytics Setup",
      description: "Configure Google Analytics and social tracking pixels",
      priority: "high"
    },
    {
      scenarioRef: "scenario-3",
      title: "Dashboard Creation",
      description: "Build executive dashboard with key performance metrics",
      priority: "medium"
    }
  ],
  steps: [
    {
      taskRef: "Audience Research",
      title: "Demographic Analysis",
      description: "Analyze demographic data of current customers",
      type: "text-input"
    },
    {
      taskRef: "Audience Research",
      title: "Competitor Analysis",
      description: "Research competitors' audience targeting strategies",
      type: "text-input"
    },
    {
      taskRef: "Audience Research",
      title: "Persona Development",
      description: "Create detailed buyer personas based on research",
      type: "step-reference"
    },
    {
      taskRef: "Content Calendar",
      title: "Theme Development",
      description: "Brainstorm monthly content themes aligned with business goals",
      type: "text-input"
    },
    {
      taskRef: "Content Calendar",
      title: "Content Types Definition",
      description: "Define mix of content types (blog, video, social, etc.)",
      type: "simple-plugin"
    },
    {
      taskRef: "Editorial Guidelines",
      title: "Tone & Voice Document",
      description: "Document brand voice characteristics and examples",
      type: "text-input"
    },
    {
      taskRef: "Editorial Guidelines",
      title: "Style Guide Creation",
      description: "Compile comprehensive style guide for all content creators",
      type: "text-input"
    },
    {
      taskRef: "Platform Audit",
      title: "Performance Review",
      description: "Document current engagement metrics across all platforms",
      type: "text-input"
    },
    {
      taskRef: "Platform Audit",
      title: "Competitive Analysis",
      description: "Analyze competitor social media strategies and performance",
      type: "text-input"
    },
    {
      taskRef: "Campaign Creative",
      title: "Visual Style Guide",
      description: "Create guidelines for campaign visual identity",
      type: "simple-plugin"
    },
    {
      taskRef: "Campaign Creative",
      title: "Copy Development",
      description: "Write copy templates for different post types",
      type: "text-input"
    },
    {
      taskRef: "Engagement Strategy",
      title: "Response Guidelines",
      description: "Create community management response guidelines",
      type: "text-input"
    },
    {
      taskRef: "Analytics Setup",
      title: "Conversion Tracking",
      description: "Set up conversion tracking for key business objectives",
      type: "text-input"
    },
    {
      taskRef: "Analytics Setup",
      title: "Custom Events",
      description: "Configure custom event tracking for user interactions",
      type: "simple-plugin"
    },
    {
      taskRef: "Dashboard Creation",
      title: "Metrics Definition",
      description: "Define KPIs and metrics to include in dashboard",
      type: "text-input"
    },
    {
      taskRef: "Dashboard Creation",
      title: "Dashboard Building",
      description: "Construct interactive dashboard with data visualizations",
      type: "step-reference"
    }
  ]
};