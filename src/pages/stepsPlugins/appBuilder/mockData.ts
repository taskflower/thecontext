// mockData.ts

export const marketingAppMockTasks = [
    {
      title: "Campaign Information",
      description: "Collect basic campaign information",
      steps: [
        {
          type: "data-collector",
          title: "Campaign Details",
          description: "Collect campaign information",
          config: {
            fields: [
              { id: 'campaignName', label: 'Campaign Name', type: 'text', required: true },
              { id: 'objective', label: 'Campaign Objective', type: 'select', required: true,
                options: ['Brand Awareness', 'Lead Generation', 'Sales', 'Customer Retention'] },
              { id: 'budget', label: 'Budget', type: 'number', required: true },
              { id: 'timeline', label: 'Duration (days)', type: 'number', required: true }
            ]
          }
        }
      ]
    },
    {
      title: "Website Analysis",
      description: "Analyze website and generate marketing insights",
      steps: [
        {
          type: "data-collector",
          title: "Website Information",
          description: "Collect website information for analysis",
          config: {
            fields: [
              { id: 'domain', label: 'Website Domain', type: 'url', required: true },
              { id: 'competitors', label: 'Main Competitors (comma separated)', type: 'text', required: false }
            ]
          }
        },
        {
          type: "llm-generator",
          title: "Website Analysis",
          description: "Generate website analysis and insights",
          config: {
            systemPrompt: "You are a marketing analyst specializing in website analysis",
            userPrompt: "Analyze the website based on the provided domain. Focus on user experience, content quality, and conversion optimization opportunities."
          }
        }
      ]
    },
    {
      title: "Target Audience Analysis",
      description: "Define and analyze target audience segments",
      steps: [
        {
          type: "llm-generator",
          title: "Target Audience Definition",
          description: "Define key target audience segments",
          config: {
            systemPrompt: "You are a market research specialist focusing on audience segmentation",
            userPrompt: "Based on the website analysis and campaign objectives, identify and define 3-5 key target audience segments. For each segment, include demographics, psychographics, pain points, and goals."
          }
        },
        {
          type: "document-editor",
          title: "Audience Personas Document",
          description: "Create detailed audience personas document",
          config: {
            documentTitle: "Target Audience Personas",
            documentType: "markdown",
            initialContent: "# Target Audience Personas\n\n[This document will contain detailed descriptions of each target audience segment]",
            tags: ["Marketing", "Audience", "Personas"]
          }
        }
      ]
    },
    {
      title: "Marketing Strategy",
      description: "Develop comprehensive marketing strategy",
      steps: [
        {
          type: "llm-generator",
          title: "Marketing Strategy Generation",
          description: "Generate comprehensive marketing strategy",
          config: {
            systemPrompt: "You are a senior marketing strategist",
            userPrompt: "Create a comprehensive marketing strategy based on the campaign objectives, website analysis, and target audience segments. Include channels, messaging approach, content types, timeline, and budget allocation."
          }
        },
        {
          type: "document-editor",
          title: "Marketing Strategy Document",
          description: "Edit and finalize marketing strategy document",
          config: {
            documentTitle: "Marketing Strategy",
            documentType: "markdown",
            saveAsDocument: true,
            tags: ["Marketing", "Strategy"]
          }
        }
      ]
    },
    {
      title: "Implementation Plan",
      description: "Create detailed implementation plan",
      steps: [
        {
          type: "llm-generator",
          title: "Implementation Plan Generation",
          description: "Generate detailed implementation plan",
          config: {
            systemPrompt: "You are a project manager specializing in marketing campaigns",
            userPrompt: "Create a detailed implementation plan for the marketing strategy. Include timeline, responsible parties, deliverables, and KPIs to track."
          }
        },
        {
          type: "document-editor",
          title: "Implementation Plan Document",
          description: "Edit and finalize implementation plan",
          config: {
            documentTitle: "Implementation Plan",
            documentType: "markdown",
            saveAsDocument: true,
            tags: ["Marketing", "Implementation", "Plan"]
          }
        }
      ]
    }
  ];
  
  export const websiteAppMockTasks = [
    {
      title: "Website Information",
      description: "Collect website information",
      steps: [
        {
          type: "data-collector",
          title: "Website Details",
          description: "Collect basic website information",
          config: {
            fields: [
              { id: 'domain', label: 'Website Domain', type: 'url', required: true },
              { id: 'industry', label: 'Industry', type: 'select', required: true,
                options: ['E-commerce', 'SaaS', 'Healthcare', 'Education', 'Finance', 'Other'] },
              { id: 'competitors', label: 'Main Competitors (comma separated)', type: 'text', required: false }
            ]
          }
        }
      ]
    },
    {
      title: "Website Analysis",
      description: "Comprehensive website analysis",
      steps: [
        {
          type: "llm-generator",
          title: "Website Analysis",
          description: "Generate comprehensive website analysis",
          config: {
            systemPrompt: "You are a website analyst specializing in UX, content, and SEO",
            userPrompt: "Create a comprehensive analysis of the website. Include strengths, weaknesses, opportunities for improvement, content quality, user experience, and technical performance."
          }
        },
        {
          type: "document-editor",
          title: "Website Analysis Document",
          description: "Edit and finalize website analysis",
          config: {
            documentTitle: "Website Analysis Report",
            documentType: "markdown",
            saveAsDocument: true,
            tags: ["Website", "Analysis", "Report"]
          }
        }
      ]
    },
    {
      title: "Competitor Analysis",
      description: "Analyze competitors' websites",
      steps: [
        {
          type: "llm-generator",
          title: "Competitor Analysis",
          description: "Generate competitor analysis",
          config: {
            systemPrompt: "You are a competitive analysis specialist",
            userPrompt: "Create a detailed analysis comparing the website with its main competitors. Focus on design, user experience, content quality, features, and unique selling points."
          }
        },
        {
          type: "document-editor",
          title: "Competitor Analysis Document",
          description: "Edit and finalize competitor analysis",
          config: {
            documentTitle: "Competitor Analysis Report",
            documentType: "markdown",
            saveAsDocument: true,
            tags: ["Competitor", "Analysis", "Report"]
          }
        }
      ]
    },
    {
      title: "SEO Improvements",
      description: "Generate SEO recommendations",
      steps: [
        {
          type: "llm-generator",
          title: "SEO Recommendations",
          description: "Generate SEO recommendations",
          config: {
            systemPrompt: "You are an SEO expert",
            userPrompt: "Create a list of SEO recommendations for the website. Include on-page SEO, content strategy, keyword opportunities, and technical improvements."
          }
        },
        {
          type: "document-editor",
          title: "SEO Recommendations Document",
          description: "Edit and finalize SEO recommendations",
          config: {
            documentTitle: "SEO Recommendations",
            documentType: "markdown",
            saveAsDocument: true,
            tags: ["SEO", "Recommendations", "Website"]
          }
        }
      ]
    },
    {
      title: "Implementation Plan",
      description: "Create website improvement plan",
      steps: [
        {
          type: "llm-generator",
          title: "Implementation Plan",
          description: "Generate implementation plan for website improvements",
          config: {
            systemPrompt: "You are a project manager specializing in website improvements",
            userPrompt: "Create a detailed implementation plan for the website improvements. Include timeline, responsible parties, deliverables, and priority order."
          }
        },
        {
          type: "document-editor",
          title: "Implementation Plan Document",
          description: "Edit and finalize implementation plan",
          config: {
            documentTitle: "Website Improvement Plan",
            documentType: "markdown",
            saveAsDocument: true,
            tags: ["Website", "Implementation", "Plan"]
          }
        }
      ]
    }
  ];
  
  export const genericAppMockTasks = [
    {
      title: "Requirement Gathering",
      description: "Collect project requirements",
      steps: [
        {
          type: "data-collector",
          title: "Project Requirements",
          description: "Collect basic project requirements",
          config: {
            useLLMToGenerateFields: true,
            fieldGenerationPrompt: "Generate form fields to collect requirements for the application"
          }
        }
      ]
    },
    {
      title: "Research Phase",
      description: "Research and analysis",
      steps: [
        {
          type: "llm-generator",
          title: "Situation Analysis",
          description: "Generate current situation analysis",
          config: {
            systemPrompt: "You are an analyst specialized in business and project analysis",
            userPrompt: "Create a comprehensive analysis of the current situation related to the project. Include strengths, weaknesses, opportunities, and challenges."
          }
        },
        {
          type: "document-editor",
          title: "Research Document",
          description: "Edit and finalize research document",
          config: {
            documentTitle: "Research and Analysis",
            documentType: "markdown",
            saveAsDocument: true,
            tags: ["Research", "Analysis"]
          }
        }
      ]
    },
    {
      title: "Strategic Planning",
      description: "Develop project strategy",
      steps: [
        {
          type: "llm-generator",
          title: "Strategic Recommendations",
          description: "Generate strategic recommendations",
          config: {
            systemPrompt: "You are a strategic consultant",
            userPrompt: "Create a set of strategic recommendations for the project. Include short-term and long-term goals, action items, and success metrics."
          }
        },
        {
          type: "document-editor",
          title: "Strategy Document",
          description: "Edit and finalize strategy document",
          config: {
            documentTitle: "Strategic Plan",
            documentType: "markdown",
            saveAsDocument: true,
            tags: ["Strategy", "Planning"]
          }
        }
      ]
    },
    {
      title: "Implementation Plan",
      description: "Create implementation plan",
      steps: [
        {
          type: "llm-generator",
          title: "Implementation Plan",
          description: "Generate implementation plan",
          config: {
            systemPrompt: "You are a project management expert",
            userPrompt: "Create a detailed implementation plan for the project. Include timeline, resource requirements, key milestones, and potential risks."
          }
        },
        {
          type: "document-editor",
          title: "Implementation Plan Document",
          description: "Edit and finalize implementation plan",
          config: {
            documentTitle: "Implementation Plan",
            documentType: "markdown",
            saveAsDocument: true,
            tags: ["Implementation", "Plan"]
          }
        }
      ]
    }
  ];