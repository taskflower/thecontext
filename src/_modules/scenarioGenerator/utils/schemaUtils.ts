// src/_modules/scenarioGenerator/utils/schemaUtils.ts
import { FormField } from '../types';

/**
 * Creates a sample form schema based on a step name or purpose
 */
export function generateSampleSchema(stepId: string, stepName = ''): FormField[] {
  const normalizedName = stepName.toLowerCase();
  
  // Default schema for general purposes
  const defaultSchema: FormField[] = [
    {
      name: 'text_input',
      label: 'Text Input',
      type: 'text',
      required: true,
      placeholder: 'Enter text here'
    },
    {
      name: 'number_input',
      label: 'Number Input',
      type: 'number',
      required: false,
      placeholder: 'Enter a number'
    }
  ];
  
  // Financial schema
  if (
    normalizedName.includes('finance') || 
    normalizedName.includes('financial') || 
    normalizedName.includes('budget') ||
    normalizedName.includes('cost') ||
    normalizedName.includes('revenue') ||
    normalizedName.includes('expense')
  ) {
    return [
      {
        name: 'revenue',
        label: 'Revenue (USD)',
        type: 'number',
        required: true,
        placeholder: 'Enter projected revenue'
      },
      {
        name: 'costs',
        label: 'Costs (USD)',
        type: 'number',
        required: true,
        placeholder: 'Enter projected costs'
      },
      {
        name: 'time_period',
        label: 'Time Period',
        type: 'select',
        required: true,
        options: [
          { value: 'monthly', label: 'Monthly' },
          { value: 'quarterly', label: 'Quarterly' },
          { value: 'annual', label: 'Annual' }
        ],
        defaultValue: 'annual'
      }
    ];
  }
  
  // User information schema
  if (
    normalizedName.includes('user') || 
    normalizedName.includes('profile') || 
    normalizedName.includes('personal') ||
    normalizedName.includes('contact')
  ) {
    return [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name'
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'text',
        required: true,
        placeholder: 'Enter your email address'
      },
      {
        name: 'organization',
        label: 'Organization',
        type: 'text',
        required: false,
        placeholder: 'Enter your organization'
      }
    ];
  }
  
  // Project planning schema
  if (
    normalizedName.includes('project') || 
    normalizedName.includes('plan') || 
    normalizedName.includes('task') ||
    normalizedName.includes('goal')
  ) {
    return [
      {
        name: 'project_name',
        label: 'Project Name',
        type: 'text',
        required: true,
        placeholder: 'Enter project name'
      },
      {
        name: 'start_date',
        label: 'Start Date',
        type: 'date',
        required: true
      },
      {
        name: 'deadline',
        label: 'Deadline',
        type: 'date',
        required: true
      },
      {
        name: 'description',
        label: 'Project Description',
        type: 'textarea',
        required: false,
        placeholder: 'Describe your project'
      }
    ];
  }
  
  // Analysis schema
  if (
    normalizedName.includes('analysis') || 
    normalizedName.includes('analyze') || 
    normalizedName.includes('research') ||
    normalizedName.includes('report')
  ) {
    return [
      {
        name: 'topic',
        label: 'Analysis Topic',
        type: 'text',
        required: true,
        placeholder: 'Enter the topic to analyze'
      },
      {
        name: 'parameters',
        label: 'Parameters',
        type: 'textarea',
        required: false,
        placeholder: 'Enter any specific parameters for the analysis'
      },
      {
        name: 'priority',
        label: 'Priority Level',
        type: 'select',
        required: false,
        options: [
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' }
        ],
        defaultValue: 'medium'
      }
    ];
  }
  
  // Return default schema if no match
  return defaultSchema;
}

/**
 * Generates a default LLM prompt based on form schema and step purpose
 */
export function generateDefaultLlmPrompt(
  previousStepContextPath?: string, 
  schemaFields?: FormField[]
): string {
  if (!previousStepContextPath) {
    return 'Please analyze the provided data and return insights as JSON.';
  }
  
  let fieldsList = '';
  if (schemaFields && schemaFields.length > 0) {
    fieldsList = schemaFields.map(field => `${field.label}: {{${previousStepContextPath}.${field.name}}}`).join(', ');
  }
  
  return `Based on the following data: ${fieldsList || `{{${previousStepContextPath}}}`}, 
please analyze and provide insights. Return a JSON with the following structure:
{
  "result": "Primary result or calculation",
  "analysis": "Detailed analysis and explanation",
  "recommendations": ["List", "of", "recommendations"]
}`;
}

/**
 * Generates default widgets based on previous steps
 */
export function generateDefaultWidgets(
  previousStepContextPath?: string, 
  stepName = ''
): any[] {
  const normalizedName = stepName.toLowerCase();
  
  // Default widgets configuration
  const defaultWidgets = [
    { 
      tplFile: 'title', 
      title: 'Results'
    },
    { 
      tplFile: 'info', 
      title: 'Analysis',
      dataPath: previousStepContextPath || 'results.analysis' 
    }
  ];
  
  // Financial widgets
  if (
    normalizedName.includes('finance') || 
    normalizedName.includes('financial') || 
    normalizedName.includes('budget') ||
    normalizedName.includes('roi')
  ) {
    return [
      { 
        tplFile: 'title', 
        title: 'Financial Analysis Results'
      },
      {
        tplFile: 'stats',
        title: 'Key Metrics',
        dataPaths: previousStepContextPath ? {
          'Revenue': `${previousStepContextPath}.revenue || ${previousStepContextPath}.result`,
          'Costs': `${previousStepContextPath}.costs`,
          'Profit': `${previousStepContextPath}.profit`
        } : {
          'Result': 'results.result'
        }
      },
      { 
        tplFile: 'info', 
        title: 'Analysis Details',
        dataPath: previousStepContextPath ? `${previousStepContextPath}.analysis` : 'results.analysis',
        variant: 'info'
      }
    ];
  }
  
  // Project widgets
  if (
    normalizedName.includes('project') || 
    normalizedName.includes('plan') || 
    normalizedName.includes('task')
  ) {
    return [
      { 
        tplFile: 'title', 
        title: 'Project Analysis' 
      },
      {
        tplFile: 'stats',
        title: 'Project Overview',
        dataPaths: previousStepContextPath ? {
          'Completion': `${previousStepContextPath}.completion`,
          'Status': `${previousStepContextPath}.status`,
          'Priority': `${previousStepContextPath}.priority`
        } : {
          'Result': 'results.result'
        }
      },
      { 
        tplFile: 'info', 
        title: 'Recommendations',
        dataPath: previousStepContextPath ? `${previousStepContextPath}.recommendations` : 'results.recommendations',
        variant: 'success'
      }
    ];
  }
  
  return defaultWidgets;
}