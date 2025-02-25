// src/utils/ragnarok/defaultTemplates.ts

import { ITaskTemplate } from "./taskTypes";




export const defaultTemplates: ITaskTemplate[] = [
  {
    id: 'basic-research',
    name: 'Basic Research',
    description: 'Template for collecting and analyzing information from documents',
    defaultSteps: [
      { order: 1, type: 'retrieval', description: 'Find relevant information' },
      { order: 2, type: 'processing', description: 'Analyze found information' },
      { order: 3, type: 'generation', description: 'Generate summary' }
    ],
    defaultPriority: 'medium'
  },
  {
    id: 'document-generation',
    name: 'Document Generation',
    description: 'Template for creating new documents based on existing ones',
    defaultSteps: [
      { order: 1, type: 'retrieval', description: 'Find necessary information' },
      { order: 2, type: 'generation', description: 'Create document draft' },
      { order: 3, type: 'validation', description: 'Check document correctness' }
    ],
    defaultPriority: 'high'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Template for analyzing document data and creating insights',
    defaultSteps: [
      { order: 1, type: 'retrieval', description: 'Collect document data' },
      { order: 2, type: 'processing', description: 'Process and analyze data' },
      { order: 3, type: 'generation', description: 'Generate analysis report' },
      { order: 4, type: 'validation', description: 'Validate insights' }
    ],
    defaultPriority: 'medium'
  },
  // Szablon kampanii marketingowej
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Template for preparing a marketing campaign',
    defaultSteps: [
      { order: 1, type: 'retrieval', description: 'Collect marketing materials and competitor data' },
      { order: 2, type: 'processing', description: 'Analyze market trends and opportunities' },
      { order: 3, type: 'generation', description: 'Generate initial campaign plan' },
      { order: 4, type: 'validation', description: 'Validate campaign plan' }
    ],
    defaultPriority: 'high'
  }
];
