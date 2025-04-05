/**
 * Main Application Component
 * Implementation of the workspace → scenario → flow pattern
 */
import React, { useState } from 'react';
import type { TemplateConfig } from './templates/types';
import { useTemplateSystem } from './core/hooks/useTemplateSystem';
import { HookPointProvider } from './hookPoints';
import { PluginProvider } from './plugins/context';
import { apiServicePlugin } from './plugins/samples/index';
import FlowPlayer from './flow/components/FlowPlayer';
import ContextManager, { useContextStore } from './modules/context';

// Define our app view states
type AppView = 'workspaces' | 'scenarios' | 'flow' | 'templates' | 'edit-node' | 'context-manager';

interface Workspace {
  id: string;
  name: string;
  description?: string;
}

interface Scenario {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  nodes: any[];
}

interface Node {
  id: string;
  label: string;
  description?: string;
  position: { x: number, y: number };
  assistantMessage?: string;
  contextKey?: string;
  contextJsonPath?: string;
  pluginKey?: string;
  pluginData?: Record<string, any>;
}

const App: React.FC = () => {
  // State for managing active view
  const [activeView, setActiveView] = useState<AppView>('workspaces');
  
  // State for workspace and scenario
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // State for template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');
  
  // State for showing options
  const [showOptions, setShowOptions] = useState(false);
  
  // State for scenarios data - now we need to be able to update it
  const [scenariosData, setScenariosData] = useState<Scenario[]>([
    // Education Workspace Scenarios
    {
      id: 'scenario-1',
      workspaceId: 'workspace-1',
      name: 'Introduction to Templates',
      description: 'Learn how the template system works',
      nodes: [
        {
          id: "node-1-1",
          label: "Introduction",
          description: "Templates overview",
          position: { x: 100, y: 100 },
          assistantMessage: "Welcome to the **Templates Introduction**! Templates allow you to change the visual style of the application without changing the underlying functionality.",
          contextKey: "template_feedback"
        },
        {
          id: "node-1-2",
          label: "Template Components",
          description: "Understanding template components",
          position: { x: 300, y: 100 },
          assistantMessage: "Templates consist of several key components:\n\n- Header\n- Navigation\n- Message display\n- User input\n\nEach template provides its own implementation of these components.",
          contextKey: "component_feedback"
        },
        {
          id: "node-1-3",
          label: "Try Templates",
          description: "Try different templates",
          position: { x: 500, y: 100 },
          assistantMessage: "Use the template selector in the options menu to switch between different visual styles.\n\nWhich template do you prefer and why?",
          contextKey: "template_preference"
        }
      ]
    },
    {
      id: 'scenario-2',
      workspaceId: 'workspace-1',
      name: 'Plugin System Tutorial',
      description: 'Understand how plugins extend functionality',
      nodes: [
        {
          id: "node-2-1",
          label: "Introduction to Plugins",
          description: "Plugin system overview",
          position: { x: 100, y: 100 },
          assistantMessage: "Welcome to the **Plugin System Tutorial**! Plugins allow extending the application with custom functionality.\n\nPlugins can add new features without modifying the core application.",
          contextKey: "plugin_feedback"
        },
        {
          id: "node-2-2",
          label: "API Service Plugin",
          description: "Demo of the API service plugin",
          position: { x: 300, y: 100 },
          assistantMessage: "Below is a demonstration of the API Service plugin. This plugin allows integration with external APIs.\n\nTry clicking the button to see it in action!",
          contextKey: "api_feedback",
          pluginKey: "api-service",
          pluginData: {
            "api-service": {
              buttonText: "Execute API Call",
              apiUrl: "https://api.example.com/demo",
              autoAdvanceOnSuccess: false,
              responseMessage: "API integration successful! In a real application, this would connect to an actual API endpoint."
            }
          }
        },
        {
          id: "node-2-3",
          label: "Plugin Development",
          description: "How to create custom plugins",
          position: { x: 500, y: 100 },
          assistantMessage: "Creating custom plugins involves:\n\n1. Defining a plugin manifest\n2. Creating plugin components\n3. Registering the plugin\n\nWhat kind of plugin would you create?",
          contextKey: "plugin_idea"
        }
      ]
    },
    // Development Workspace Scenarios
    {
      id: 'scenario-3',
      workspaceId: 'workspace-2',
      name: 'React Basics',
      description: 'Introduction to React development',
      nodes: [
        {
          id: "node-3-1",
          label: "React Components",
          description: "Introduction to React components",
          position: { x: 100, y: 100 },
          assistantMessage: "Welcome to React Basics! React is a JavaScript library for building user interfaces based on components.\n\nComponents are reusable pieces of code that return React elements describing what should appear on the screen.",
          contextKey: "react_understanding"
        },
        {
          id: "node-3-2",
          label: "State and Props",
          description: "Understanding state and props",
          position: { x: 300, y: 100 },
          assistantMessage: "React components use two types of data:\n\n1. **Props** - Passed down from parent (read-only)\n2. **State** - Internal component data that can change\n\nHow would you describe the difference between them?",
          contextKey: "state_props_answer"
        }
      ]
    },
    // Customer Support Workspace Scenarios
    {
      id: 'scenario-4',
      workspaceId: 'workspace-3',
      name: 'Handling Customer Complaints',
      description: 'Protocol for dealing with upset customers',
      nodes: [
        {
          id: "node-4-1",
          label: "Active Listening",
          description: "How to properly listen to customer issues",
          position: { x: 100, y: 100 },
          assistantMessage: "When a customer has a complaint, the first step is **active listening**:\n\n- Let them explain their issue without interruption\n- Show empathy and understanding\n- Take notes on key points\n\nWhat else would you add to this approach?",
          contextKey: "listening_feedback"
        },
        {
          id: "node-4-2",
          label: "Solution Options",
          description: "Presenting options to the customer",
          position: { x: 300, y: 100 },
          assistantMessage: "After understanding the issue, present solution options clearly:\n\n1. Explain what you can do immediately\n2. Outline additional steps if needed\n3. Be honest about limitations\n\nHow would you handle a situation where you can't fully resolve their issue?",
          contextKey: "solution_approach"
        }
      ]
    }
  ]);

  // State for node editing form
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  
  // Template system
  const { 
    availableTemplates, 
    currentTemplateId, 
    setCurrentTemplateId 
  } = useTemplateSystem({
    initialTemplateId: selectedTemplateId
  });
  
  // Sample workspaces
  const workspaces: Workspace[] = [
    {
      id: 'workspace-1',
      name: 'Education Workspace',
      description: 'Contains educational scenarios and learning materials'
    },
    {
      id: 'workspace-2',
      name: 'Development Workspace',
      description: 'Programming and development training flows'
    },
    {
      id: 'workspace-3',
      name: 'Customer Support',
      description: 'Customer support scripts and scenarios'
    }
  ];
  
  // Function to get scenarios for a workspace
  const getWorkspaceScenarios = (workspaceId: string) => {
    return scenariosData.filter(scenario => scenario.workspaceId === workspaceId);
  };
  
  // Function to find a specific scenario
  const getScenario = (scenarioId: string) => {
    return scenariosData.find(scenario => scenario.id === scenarioId);
  };

  // Function to find a specific node
  const getNode = (scenarioId: string, nodeId: string) => {
    const scenario = getScenario(scenarioId);
    if (!scenario) return null;
    return scenario.nodes.find(node => node.id === nodeId);
  };

  // Function to update a node
  const updateNode = (scenarioId: string, nodeId: string, updates: Partial<Node>) => {
    setScenariosData(prevScenarios => 
      prevScenarios.map(scenario => {
        if (scenario.id !== scenarioId) return scenario;
        
        return {
          ...scenario,
          nodes: scenario.nodes.map(node => 
            node.id === nodeId ? { ...node, ...updates } : node
          )
        };
      })
    );
  };
  
  // Handle workspace selection
  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setSelectedScenarioId(null);
    setActiveView('scenarios');
  };
  
  // Handle opening context manager
  const handleOpenContextManager = (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWorkspaceId(workspaceId);
    setSelectedScenarioId(null);
    setActiveView('context-manager');
  };
  
  // Handle scenario selection
  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setActiveView('flow');
  };

  // Handle node editing
  const handleEditNode = (scenarioId: string, nodeId: string) => {
    const node = getNode(scenarioId, nodeId);
    if (!node) return;
    
    setSelectedNodeId(nodeId);
    setEditingNode({ ...node });
    setActiveView('edit-node');
  };

  // Handle node update
  const handleNodeUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedScenarioId || !selectedNodeId || !editingNode) return;
    
    updateNode(selectedScenarioId, selectedNodeId, editingNode);
    setActiveView('flow');
  };
  
  // Handle back navigation
  const handleBack = () => {
    switch (activeView) {
      case 'scenarios':
        setActiveView('workspaces');
        setSelectedWorkspaceId(null);
        break;
      case 'flow':
        setActiveView('scenarios');
        setSelectedScenarioId(null);
        break;
      case 'templates':
        // Return to previous view
        if (selectedScenarioId) {
          setActiveView('flow');
        } else if (selectedWorkspaceId) {
          setActiveView('scenarios');
        } else {
          setActiveView('workspaces');
        }
        break;
      case 'edit-node':
        setActiveView('flow');
        setEditingNode(null);
        setSelectedNodeId(null);
        break;
      case 'context-manager':
        // Go back to scenarios if we came from there, otherwise go to workspaces
        if (selectedScenarioId) {
          setActiveView('scenarios');
        } else if (selectedWorkspaceId) {
          setActiveView('scenarios');
        } else {
          setActiveView('workspaces');
        }
        break;
      default:
        setActiveView('workspaces');
    }
  };
  
  // Render workspaces screen
  const renderWorkspacesScreen = () => (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Workspaces</h1>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={() => setActiveView('templates')}
          >
            Change Template
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={() => setShowOptions(!showOptions)}
          >
            {showOptions ? 'Hide Options' : 'Show Options'}
          </button>
        </div>
      </div>
      
      {showOptions && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h2 className="text-lg font-semibold mb-3">Application Options</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => {
                  setSelectedTemplateId(e.target.value);
                  setCurrentTemplateId(e.target.value);
                }}
                className="w-full p-2 border border-gray-300 rounded"
              >
                {availableTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <div 
            key={workspace.id}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all"
            onClick={() => handleSelectWorkspace(workspace.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">{workspace.name}</h2>
                {workspace.description && (
                  <p className="text-gray-600 mb-3">{workspace.description}</p>
                )}
                <div className="text-sm text-gray-500">
                  {getWorkspaceScenarios(workspace.id).length} scenarios
                </div>
              </div>
              
              <button
                onClick={(e) => handleOpenContextManager(workspace.id, e)}
                className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Manage Context
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Render scenarios screen
  const renderScenariosScreen = () => {
    const workspace = workspaces.find(w => w.id === selectedWorkspaceId);
    const workspaceScenarios = getWorkspaceScenarios(selectedWorkspaceId || '');
    
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button 
              className="text-blue-500 mb-2 flex items-center"
              onClick={handleBack}
            >
              ← Back to Workspaces
            </button>
            <h1 className="text-3xl font-bold">{workspace?.name} Scenarios</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={(e) => handleOpenContextManager(selectedWorkspaceId || '', e)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Manage Context
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => setShowOptions(!showOptions)}
            >
              {showOptions ? 'Hide Options' : 'Show Options'}
            </button>
          </div>
        </div>
        
        {showOptions && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h2 className="text-lg font-semibold mb-3">Scenario Options</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    setCurrentTemplateId(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {availableTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  New Scenario
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaceScenarios.map((scenario) => (
            <div 
              key={scenario.id}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all"
              onClick={() => handleSelectScenario(scenario.id)}
            >
              <h2 className="text-xl font-bold mb-2">{scenario.name}</h2>
              {scenario.description && (
                <p className="text-gray-600 mb-3">{scenario.description}</p>
              )}
              <div className="text-sm text-gray-500">
                {scenario.nodes.length} steps
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render templates selection screen
  const renderTemplatesScreen = () => (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <button 
          className="text-blue-500 mr-4 flex items-center"
          onClick={handleBack}
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold">Template Selection</h1>
      </div>
      
      <p className="text-gray-600 mb-8">
        Choose a template to see how the UI changes while maintaining the same functionality.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availableTemplates.map((template: TemplateConfig) => (
          <div 
            key={template.id}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              currentTemplateId === template.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
            onClick={() => setCurrentTemplateId(template.id)}
          >
            <h2 className="text-xl font-bold mb-2">{template.name}</h2>
            <p className="text-gray-600 mb-3">{template.description}</p>
            <p className="text-sm text-gray-500">Author: {template.author}</p>
            <p className="text-sm text-gray-500">Version: {template.version}</p>
            
            {currentTemplateId === template.id && (
              <div className="mt-4 text-blue-700 font-medium">Currently selected</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          onClick={() => {
            setSelectedTemplateId(currentTemplateId);
            handleBack();
          }}
        >
          Apply {availableTemplates.find(t => t.id === currentTemplateId)?.name} Template
        </button>
      </div>
    </div>
  );

  // Render node editor
  const renderNodeEditor = () => {
    if (!editingNode) return null;

    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <button 
            className="text-blue-500 mr-4 flex items-center"
            onClick={handleBack}
          >
            ← Back to Flow
          </button>
          <h1 className="text-3xl font-bold">Edit Node</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleNodeUpdate} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Node Label</label>
                  <input
                    type="text"
                    value={editingNode.label}
                    onChange={(e) => setEditingNode({...editingNode, label: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={editingNode.description || ''}
                    onChange={(e) => setEditingNode({...editingNode, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Assistant Message */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Assistant Message</h2>
              <div>
                <textarea
                  value={editingNode.assistantMessage || ''}
                  onChange={(e) => setEditingNode({...editingNode, assistantMessage: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={8}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supports Markdown formatting
                </p>
              </div>
            </div>

            {/* Context Configuration */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Context Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Context Key</label>
                  <input
                    type="text"
                    value={editingNode.contextKey || ''}
                    onChange={(e) => setEditingNode({...editingNode, contextKey: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="e.g. user_input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variable name to store user's response
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Context JSON Path</label>
                  <input
                    type="text"
                    value={editingNode.contextJsonPath || ''}
                    onChange={(e) => setEditingNode({...editingNode, contextJsonPath: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="e.g. answers.question1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional path for nested data
                  </p>
                </div>
              </div>
            </div>

            {/* Plugin Configuration */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Plugin Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Plugin Key</label>
                  <select
                    value={editingNode.pluginKey || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setEditingNode({
                        ...editingNode, 
                        pluginKey: newValue || undefined,
                        // Initialize plugin data if not already present and plugin selected
                        pluginData: newValue && !editingNode.pluginData ? 
                          { [newValue]: {} } : editingNode.pluginData
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">No Plugin</option>
                    <option value="api-service">API Service</option>
                    <option value="input-field">Input Field</option>
                    <option value="multiple-choice">Multiple Choice</option>
                  </select>
                </div>
              </div>

              {/* Plugin-specific configuration */}
              {editingNode.pluginKey === 'api-service' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium mb-3">API Service Configuration</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Button Text</label>
                      <input
                        type="text"
                        value={editingNode.pluginData?.['api-service']?.buttonText || 'Send API Request'}
                        onChange={(e) => {
                          setEditingNode({
                            ...editingNode,
                            pluginData: {
                              ...editingNode.pluginData,
                              'api-service': {
                                ...editingNode.pluginData?.['api-service'],
                                buttonText: e.target.value
                              }
                            }
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">API URL</label>
                      <input
                        type="text"
                        value={editingNode.pluginData?.['api-service']?.apiUrl || 'https://api.example.com'}
                        onChange={(e) => {
                          setEditingNode({
                            ...editingNode,
                            pluginData: {
                              ...editingNode.pluginData,
                              'api-service': {
                                ...editingNode.pluginData?.['api-service'],
                                apiUrl: e.target.value
                              }
                            }
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Response Message</label>
                      <input
                        type="text"
                        value={editingNode.pluginData?.['api-service']?.responseMessage || 'API request completed successfully!'}
                        onChange={(e) => {
                          setEditingNode({
                            ...editingNode,
                            pluginData: {
                              ...editingNode.pluginData,
                              'api-service': {
                                ...editingNode.pluginData?.['api-service'],
                                responseMessage: e.target.value
                              }
                            }
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoAdvance"
                        checked={editingNode.pluginData?.['api-service']?.autoAdvanceOnSuccess || false}
                        onChange={(e) => {
                          setEditingNode({
                            ...editingNode,
                            pluginData: {
                              ...editingNode.pluginData,
                              'api-service': {
                                ...editingNode.pluginData?.['api-service'],
                                autoAdvanceOnSuccess: e.target.checked
                              }
                            }
                          });
                        }}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <label htmlFor="autoAdvance" className="ml-2 text-sm text-gray-700">
                        Auto-advance on success
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Render flow player with edit controls
  const renderFlowPlayer = () => {
    const scenario = getScenario(selectedScenarioId || '');
    
    if (!scenario) {
      return (
        <div className="container mx-auto p-6">
          <button 
            className="text-blue-500 mb-4 flex items-center"
            onClick={handleBack}
          >
            ← Back to Scenarios
          </button>
          <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-700">
            Scenario not found
          </div>
        </div>
      );
    }
    
    return (
      <div className="container mx-auto p-6">
        <div className="mb-4 flex justify-between items-center">
          <button 
            className="text-blue-500 flex items-center"
            onClick={handleBack}
          >
            ← Back to Scenarios
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={() => setShowOptions(!showOptions)}
          >
            {showOptions ? 'Hide Options' : 'Show Options'}
          </button>
        </div>
        
        {showOptions && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h2 className="text-lg font-semibold mb-3">Flow Options</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    setCurrentTemplateId(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {availableTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Node Management Section */}
            <div className="mt-6 pt-4 border-t border-gray-300">
              <h3 className="font-medium mb-3">Node Management</h3>
              
              <div className="mt-2 space-y-2">
                <p className="text-sm mb-2">Select a node to edit:</p>
                {scenario.nodes.map((node) => (
                  <div key={node.id} className="flex items-center">
                    <button
                      onClick={() => handleEditNode(scenario.id, node.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 mb-1 w-full text-left"
                    >
                      {node.label} {node.description ? `- ${node.description}` : ''}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center mt-4">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                >
                  Add New Step
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Save Flow
                </button>
              </div>
            </div>
          </div>
        )}
        
        <FlowPlayer 
          nodes={scenario.nodes}
          title={scenario.name}
          description={scenario.description}
          onBack={handleBack}
          onComplete={(userInputs, contextItems) => {
            console.log('Flow completed with inputs:', userInputs);
            console.log('Flow context items:', contextItems);
            
            // Here you could save the context for later use
            
            handleBack();
          }}
          templateId={selectedTemplateId}
          contextItems={[
            // Initial context items for the flow
            {
              id: 'user_name',
              title: 'User Name',
              content: 'Flow User',
              contentType: 'text/plain'
            },
            {
              id: 'scenario_info',
              title: 'Scenario Information',
              content: JSON.stringify({
                name: scenario.name,
                id: scenario.id,
                workspaceId: scenario.workspaceId,
                totalSteps: scenario.nodes.length
              }),
              contentType: 'application/json'
            },
            // Use context items from the context store if any exist
            ...(useContextStore.getState().filterItems({ workspaceId: scenario.workspaceId }) || []).map(item => ({
              id: item.id,
              title: item.title,
              content: item.content,
              contentType: item.contentType
            }))
          ]}
        />
      </div>
    );
  };
  
  // Render context manager view
  const renderContextManagerScreen = () => {
    const workspace = workspaces.find(w => w.id === selectedWorkspaceId);
    
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button 
              className="text-blue-500 mb-2 flex items-center"
              onClick={handleBack}
            >
              ← Back to Workspace
            </button>
            <h1 className="text-3xl font-bold">Context Management: {workspace?.name}</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-2 bg-gray-50 border-b border-gray-200">
              <div className="text-sm text-gray-500">
                Manage context items for this workspace. Context items can be used in flows and plugins.
              </div>
            </div>
            
            {/* Context Manager Component */}
            <div className="p-0">
              <ContextManager 
                workspaceId={selectedWorkspaceId || ''}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Main render
  return (
    <HookPointProvider>
      <PluginProvider initialPlugins={[apiServicePlugin]}>
        <div className="min-h-screen bg-gray-100">
          <header className="bg-white shadow-sm p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">The Context App</h1>
                <p className="text-gray-500">Template-based Architecture Demo</p>
              </div>
              <div className="text-sm text-gray-600">
                Current Template: <span className="font-medium">{availableTemplates.find(t => t.id === selectedTemplateId)?.name}</span>
              </div>
            </div>
          </header>
          
          <main>
            {activeView === 'workspaces' && renderWorkspacesScreen()}
            {activeView === 'scenarios' && renderScenariosScreen()}
            {activeView === 'flow' && renderFlowPlayer()}
            {activeView === 'templates' && renderTemplatesScreen()}
            {activeView === 'edit-node' && renderNodeEditor()}
            {activeView === 'context-manager' && renderContextManagerScreen()}
          </main>
        </div>
      </PluginProvider>
    </HookPointProvider>
  );
};

export default App;