/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/scenarios/ScenariosList.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Copy, ExternalLink, Clock, Cog, Terminal } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useScenarioStore } from '@/stores/scenarioStore';

export const ScenariosList: React.FC = () => {
  const { getCurrentWorkspace } = useWorkspaceStore();
  const { 
    scenarios, 
    templates,
    currentScenarioId, 
    createScenario, 
    setCurrentScenario,
    deleteScenario,
    duplicateScenario,
    createTemplate,
    applyTemplate
  } = useScenarioStore();
  
  const workspace = getCurrentWorkspace();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [newScenarioName, setNewScenarioName] = React.useState('');
  const [newScenarioDescription, setNewScenarioDescription] = React.useState('');
  
  const [activeTab, setActiveTab] = React.useState('scenarios');
  
  const handleCreateScenario = () => {
    if (!workspace || !newScenarioName.trim()) return;
    
    createScenario(newScenarioName, workspace.id, newScenarioDescription);
    setNewScenarioName('');
    setNewScenarioDescription('');
    setIsCreateDialogOpen(false);
  };
  
  // If no workspace, show message
  if (!workspace) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-slate-500">
          No active workspace. Please select or create a workspace.
        </CardContent>
      </Card>
    );
  }
  
  // Get scenarios for this workspace
  const workspaceScenarios = Object.values(scenarios)
    .filter((scenario:any) => scenario.workspaceId === workspace.id)
    .sort((a:any, b:any) => b.updatedAt - a.updatedAt);
  
  // Get all templates
  const allTemplates = Object.values(templates)
    .sort((a:any, b:any) => b.updatedAt - a.updatedAt);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scenarios</h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Scenario</DialogTitle>
              <DialogDescription>
                Create a new scenario for your prompt workflows.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={newScenarioName} 
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="My Scenario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={newScenarioDescription} 
                  onChange={(e) => setNewScenarioDescription(e.target.value)}
                  placeholder="What this scenario is for..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateScenario} disabled={!newScenarioName.trim()}>
                Create Scenario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
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
              {workspaceScenarios.map((scenario:any) => (
                <Card 
                  key={scenario.id} 
                  className={currentScenarioId === scenario.id ? 'border-2 border-blue-500' : ''}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cog className="h-5 w-5 text-blue-500" />
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
                        {scenario.nodeIds.length} {scenario.nodeIds.length === 1 ? 'node' : 'nodes'}
                      </div>
                      {scenario.templateId && (
                        <Badge variant="outline" className="bg-blue-50">
                          From template
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => duplicateScenario(scenario.id)}
                      title="Duplicate scenario"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => createTemplate(scenario.id)}
                      title="Save as template"
                    >
                      <Terminal className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteScenario(scenario.id)}
                      title="Delete scenario"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button 
                      onClick={() => setCurrentScenario(scenario.id)}
                      disabled={currentScenarioId === scenario.id}
                      className="ml-auto"
                    >
                      {currentScenarioId === scenario.id ? 'Current' : 'Open'}
                      {currentScenarioId !== scenario.id && <ExternalLink className="h-4 w-4 ml-2" />}
                    </Button>
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
              {allTemplates.map((template:any) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-green-600" />
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
                      <div>
                        {template.nodeIds.length} {template.nodeIds.length === 1 ? 'node' : 'nodes'}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => applyTemplate(template.id, workspace.id, `${template.name} Instance`)}
                      className="w-full"
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};



