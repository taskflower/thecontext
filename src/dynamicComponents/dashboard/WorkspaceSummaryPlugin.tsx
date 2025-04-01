import React from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/modules/store';
import { useNavigate } from 'react-router-dom';

interface WorkspaceSummaryPluginData {
  title?: string;
  showWorkspaceCount?: boolean;
  showScenarioCount?: boolean;
  showContextCount?: boolean;
  showActionButtons?: boolean;
}

const WorkspaceSummaryPlugin: PluginComponentWithSchema<WorkspaceSummaryPluginData> = ({ 
  data 
}: PluginComponentProps<WorkspaceSummaryPluginData>) => {
  const navigate = useNavigate();
  const workspaces = useAppStore(state => state.items);
  
  // Default data
  const pluginData: WorkspaceSummaryPluginData = {
    title: 'Workspace Summary',
    showWorkspaceCount: true,
    showScenarioCount: true,
    showContextCount: true,
    showActionButtons: true,
    ...(data || {})
  };
  
  // Calculate statistics
  const workspaceCount = workspaces.length;
  let scenarioCount = 0;
  let contextCount = 0;
  
  workspaces.forEach(workspace => {
    scenarioCount += workspace.children?.length || 0;
    contextCount += workspace.contextItems?.length || 0;
  });
  
  const handleGoToStudio = () => {
    navigate('/studio');
  };
  
  return (
    <Card className="p-4 h-full">
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-medium mb-4">{pluginData.title}</h3>
        
        <div className="space-y-4 flex-1">
          {pluginData.showWorkspaceCount && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Workspaces</span>
              <span className="font-medium">{workspaceCount}</span>
            </div>
          )}
          
          {pluginData.showScenarioCount && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Scenarios</span>
              <span className="font-medium">{scenarioCount}</span>
            </div>
          )}
          
          {pluginData.showContextCount && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Context Items</span>
              <span className="font-medium">{contextCount}</span>
            </div>
          )}
        </div>
        
        {pluginData.showActionButtons && (
          <div className="mt-4">
            <Button 
              variant="default" 
              className="w-full"
              onClick={handleGoToStudio}
            >
              Go to Studio
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

WorkspaceSummaryPlugin.pluginSettings = {
  replaceUserInput: true,
  hideNavigationButtons: true
};

WorkspaceSummaryPlugin.optionsSchema = {
  title: {
    type: 'string',
    label: 'Widget Title',
    default: 'Workspace Summary',
    description: 'Title for the summary widget'
  },
  showWorkspaceCount: {
    type: 'boolean',
    label: 'Show Workspace Count',
    default: true,
    description: 'Show the number of workspaces'
  },
  showScenarioCount: {
    type: 'boolean',
    label: 'Show Scenario Count',
    default: true,
    description: 'Show the number of scenarios'
  },
  showContextCount: {
    type: 'boolean',
    label: 'Show Context Count',
    default: true,
    description: 'Show the number of context items'
  },
  showActionButtons: {
    type: 'boolean',
    label: 'Show Action Buttons',
    default: true,
    description: 'Show buttons for common actions'
  }
};

export default WorkspaceSummaryPlugin;