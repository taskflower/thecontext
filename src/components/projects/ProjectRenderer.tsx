/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectsStore } from '@/store/projectsStore';
import { PROJECT } from './mockedproject';
import { Trans } from '@lingui/macro';

interface ColumnConfig {
  name: string;
  key: string;
  type: 'text' | 'url' | 'number' | 'date' | 'action';
}

interface ActionConfig {
  label: string;
  actionType: string;
  taskId?: string;
  tag?: string;
}

interface TabConfig {
  title: string;
  type: string;
  columns: ColumnConfig[];
  actions: ActionConfig[];
}

interface StepConfig {
  id: string;
  name: string;
  description: string;
  pluginId: string;
  config: any;
  data: any;
}

interface KanbanTask {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  templateId: string;
  steps: StepConfig[];
}

interface KanbanConfig {
  boardTemplateId: string;
  tasks: KanbanTask[];
}

interface ProjectConfig {
  name: string;
  tabs: TabConfig[];
  kanban: KanbanConfig;
}

const ProjectRenderer: React.FC = () => {
  const { projectSlug } = useParams();
  const { projects } = useProjectsStore();
  const [config, setConfig] = useState<ProjectConfig | null>(null);

  // Find the project by matching the slug with the project title
  const project = projects.find(
    (p) => p.title.toLowerCase() === projectSlug?.toLowerCase()
  );

  useEffect(() => {
    if (project) {
      // If project exists, load its configuration
      setConfig(PROJECT as ProjectConfig);
    }
  }, [project]);

  // If project doesn't exist, show error message
  if (!project) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          <Trans>Project Not Found</Trans>
        </h1>
        <p className="text-gray-600">
          <Trans>
            The requested project does not exist or you may not have access to it.
          </Trans>
        </p>
      </div>
    );
  }

  // Show loading state while configuration is being loaded
  if (!config) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <Trans>Loading project configuration...</Trans>
        </div>
      </div>
    );
  }

  // Render project content
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{project.title}</h1>
      
      {/* Project Description */}
      <div className="mb-8">
        <p className="text-gray-600">
          {project.description || (
            <span className="italic">
              <Trans>No description provided</Trans>
            </span>
          )}
        </p>
      </div>

      {/* Tabs Section */}
      {config.tabs.map((tab, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{tab.title}</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">
                <Trans>Columns</Trans>
              </h3>
              <ul className="space-y-2">
                {tab.columns.map((col, idx) => (
                  <li key={idx} className="text-gray-600">
                    {col.name} ({col.key}) - {col.type}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">
                <Trans>Actions</Trans>
              </h3>
              <ul className="space-y-2">
                {tab.actions.map((action, idx) => (
                  <li key={idx} className="text-gray-600">
                    {action.label} - {action.actionType}
                    {action.taskId && ` (Task: ${action.taskId})`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}

      {/* Kanban Board Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">
          <Trans>Kanban Board</Trans>
        </h2>
        <p className="text-gray-600 mb-4">
          <Trans>Template ID:</Trans> {config.kanban.boardTemplateId}
        </p>
        
        <div className="space-y-4">
          {config.kanban.tasks.map(task => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">{task.name}</h3>
              <p className="text-gray-600 mb-4">{task.description}</p>
              
              <h4 className="font-medium mb-2">
                <Trans>Steps</Trans>
              </h4>
              <ul className="space-y-2">
                {task.steps.map(step => (
                  <li key={step.id} className="text-gray-600">
                    <span className="font-medium">{step.name}:</span> {step.description}
                    <span className="text-gray-500 ml-2">
                      (Plugin: {step.pluginId})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectRenderer;