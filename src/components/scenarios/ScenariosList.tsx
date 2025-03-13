// src/components/scenarios/ScenariosList.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, ExternalLink, Clock, Cog, Terminal, MoreVertical, Network, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useScenarioStore } from '@/stores/scenarioStore';
import { useNodeStore } from '@/stores/nodeStore';
import { NavLink } from 'react-router-dom';
import { NewScenarioDialog } from './NewScenarioDialog';
import { ScenarioEditor } from './ScenarioEditor';

// Component displaying the number of nodes in a scenario
const ScenarioNodeCount: React.FC<{ scenarioId: string }> = ({ scenarioId }) => {
  const nodeCount = useNodeStore(state => state.getNodeCountByScenario(scenarioId));
  return (
    <>{nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}</>
  );
};

export const ScenariosList: React.FC = () => {
  const { getCurrentWorkspace } = useWorkspaceStore();
  const { 
    scenarios, 
    templates,
    currentScenarioId, 
    setCurrentScenario,
    deleteScenario,
    duplicateScenario,
  } = useScenarioStore();
  
  const workspace = getCurrentWorkspace();
  const [activeTab, setActiveTab] = useState('scenarios');
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  
  if (!workspace) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center text-slate-500">
          No active workspace. Please select or create a workspace.
        </CardContent>
      </Card>
    );
  }
  
  const workspaceScenarios = Object.values(scenarios)
    .filter((scenario) => scenario.workspaceId === workspace.id)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  
  const allTemplates = Object.values(templates)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  // Handle editing a scenario
  const handleEditScenario = (scenarioId: string) => {
    setEditingScenarioId(scenarioId);
  };

  // Handle closing the editor
  const handleCloseEditor = () => {
    setEditingScenarioId(null);
  };
  
  return (
    <div className="space-y-6">
      {editingScenarioId ? (
        <ScenarioEditor 
          scenarioId={editingScenarioId} 
          onClose={handleCloseEditor} 
        />
      ) : (
        <>
          <div className="flex justify-end items-center">
            {workspace && <NewScenarioDialog workspaceId={workspace.id} />}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4 w-max">
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scenarios">
              {workspaceScenarios.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center text-slate-500">
                    <Cog className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                    <p>No scenarios in this workspace yet. Create your first scenario to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workspaceScenarios.map((scenario) => (
                    <Card 
                      key={scenario.id} 
                      className={currentScenarioId === scenario.id ? 'border-primary' : 'border-card'}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cog className="h-5 w-5 text-black" />
                          {scenario.name}
                        </CardTitle>
                        <CardDescription>
                          {scenario.description || 'No description'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-slate-500 space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Updated {formatDistanceToNow(scenario.updatedAt, { addSuffix: true })}
                          </div>
                          <div>
                            <ScenarioNodeCount scenarioId={scenario.id} />
                          </div>
                          {scenario.templateId && (
                            <Badge variant="outline" className="bg-blue-50">
                              From template
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <div>
                          {currentScenarioId === scenario.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Tools"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem 
                                  onClick={() => handleEditScenario(scenario.id)}
                                  className="flex items-center gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => duplicateScenario(scenario.id)}
                                  className="flex items-center gap-2"
                                >
                                  <Copy className="h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => deleteScenario(scenario.id)}
                                  className="flex items-center gap-2 text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {currentScenarioId === scenario.id && (
                            <NavLink to="/flow-editor">
                              <Button variant="outline" title="Flow Editor">
                                <Network className="h-4 w-4 mr-2" /> Flow Editor
                              </Button>
                            </NavLink>
                          )}
                          {currentScenarioId !== scenario.id ? (
                            <Button 
                              variant="outline"
                              onClick={() => setCurrentScenario(scenario.id)}
                            >
                              Open
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline"
                              disabled
                            >
                              Current
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="templates">
              {allTemplates.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center text-slate-500">
                    <Terminal className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                    <p>No templates available. Save a scenario as a template to reuse it later.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allTemplates.map((template) => (
                    <Card key={template.id} className="border-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-black" />
                          {template.name}
                        </CardTitle>
                        <CardDescription>
                          {template.description || 'No description'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-slate-500 space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Created {formatDistanceToNow(template.createdAt, { addSuffix: true })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};