/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/projects/ProjectRenderer.tsx
import React, { useEffect, useState } from 'react';
import { PROJECT } from './mockedproject';

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
  const [config, setConfig] = useState<ProjectConfig | null>(null);

  useEffect(() => {
    // Zamiast fetch, wykorzystujemy lokalny JSON z pliku mockedproject.ts
    setConfig(PROJECT as ProjectConfig);
  }, []);

  if (!config) {
    return <div>Ładowanie konfiguracji...</div>;
  }

  return (
    <div>
      <h1>{config.name}</h1>
      {config.tabs.map((tab, index) => (
        <div key={index} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
          <h2>{tab.title}</h2>
          <h3>Kolumny:</h3>
          <ul>
            {tab.columns.map((col, idx) => (
              <li key={idx}>
                {col.name} ({col.key}) - typ: {col.type}
              </li>
            ))}
          </ul>
          <h3>Akcje:</h3>
          <ul>
            {tab.actions.map((action, idx) => (
              <li key={idx}>
                {action.label} - typ: {action.actionType} {action.taskId ? `(task: ${action.taskId})` : ''}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div>
        <h2>Tablica Kanban</h2>
        <p>Szablon: {config.kanban.boardTemplateId}</p>
        {config.kanban.tasks.map(task => (
          <div key={task.id} style={{ border: '1px solid #000', marginBottom: '1rem', padding: '0.5rem' }}>
            <h3>{task.name}</h3>
            <p>{task.description}</p>
            <h4>Kroki:</h4>
            <ul>
              {task.steps.map(step => (
                <li key={step.id}>
                  <strong>{step.name}</strong>: {step.description} - Plugin: {step.pluginId}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectRenderer;
