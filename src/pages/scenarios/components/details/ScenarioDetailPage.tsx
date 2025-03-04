// src/pages/scenarios/components/ScenarioDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ChevronLeft, 
  Edit3, 
  BarChart3,
  Target,
  Users,
  AlertTriangle,
  Clock,
  CheckSquare,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataStore } from '@/store';
import EditScenarioModal from '../EditScenarioModal';
import ScenarioConnectionsPanel from './ScenarioConnectionsPanel';

const ScenarioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { scenarios, tasks } = useDataStore();
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Filter related data
  const scenario = scenarios.find(s => s.id === id);
  const scenarioTasks = tasks.filter(t => t.scenarioId === id);
  
  // Handle scenario not found
  useEffect(() => {
    if (!scenario && id) {
      navigate('/scenarios');
    }
  }, [scenario, id, navigate]);
  
  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Scenario Not Found</h2>
          <p className="text-muted-foreground mb-4">The scenario you are looking for does not exist or has been deleted.</p>
          <Button onClick={() => navigate('/scenarios')}>
            Return to Scenarios
          </Button>
        </div>
      </div>
    );
  }
  
  // Generate milestone data based on tasks (if any)
  const milestones = scenarioTasks.length > 0 
    ? [
        { id: 1, title: 'Project Setup', date: scenario.startDate || scenario.dueDate, status: 'completed' },
        { id: 2, title: 'Halfway Point', date: scenario.dueDate, status: scenarioTasks.filter(t => t.status === 'completed').length >= scenarioTasks.length / 2 ? 'completed' : 'upcoming' },
        { id: 3, title: 'Project Completion', date: scenario.dueDate, status: scenario.progress === 100 ? 'completed' : 'upcoming' }
      ]
    : [];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">To Do</Badge>;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/scenarios')}
            className="mr-4"
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">{scenario.title}</h1>
          <div className="ml-3">
            {getStatusBadge(scenario.progress === 100 ? 'completed' : 'in-progress')}
          </div>
          {scenario.dueDate && (
            <div className="flex items-center text-sm text-muted-foreground ml-4">
              <Calendar size={14} className="mr-1" />
              <span>Due: {scenario.dueDate}</span>
            </div>
          )}
          <div className="ml-auto">
            <Button onClick={() => setShowEditModal(true)}>
              <Edit3 size={16} className="mr-2" />
              Edit Scenario
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({scenarioTasks.length})</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Scenario Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm mb-2">
                  <span className="font-medium">Overall Completion:</span>
                  <span className="ml-2">{scenario.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
                  <div 
                    className={`h-2 rounded-full ${
                      scenario.progress === 100
                        ? "bg-green-500"
                        : scenario.progress > 60
                        ? "bg-indigo-600"
                        : scenario.progress > 30
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${scenario.progress}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Tasks</p>
                    <p className="font-bold">{scenario.completedTasks}/{scenario.tasks}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Connected Scenarios</p>
                    <p className="font-bold">{scenario.connections?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Days Remaining</p>
                    <p className="font-bold">
                      {scenario.dueDate
                        ? Math.max(0, Math.floor((new Date(scenario.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {scenario.description 
                  ? <p>{scenario.description}</p>
                  : <p className="text-muted-foreground">No description provided</p>
                }
                
                {scenario.objective && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700">Objective</h4>
                    <p className="text-gray-600">{scenario.objective}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Milestone timeline */}
            {milestones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            milestone.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {milestone.status === 'completed' ? (
                              <CheckSquare size={14} />
                            ) : (
                              <Clock size={14} />
                            )}
                          </div>
                          {index < milestones.length - 1 && (
                            <div className="w-0.5 h-10 bg-gray-200"></div>
                          )}
                        </div>
                        <div className="pt-1">
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground">{milestone.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tasks Status</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{scenario.completedTasks}/{scenario.tasks}</div>
                  <p className="text-xs text-muted-foreground">Tasks completed</p>
                  {scenarioTasks.length > 0 && (
                    <div className="mt-2 flex items-center space-x-2">
                      <CheckCircle size={14} className="text-green-500" />
                      <span className="text-xs">
                        {Math.round((scenario.completedTasks / scenario.tasks) * 100)}% completion rate
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Target Audience</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {scenario.target?.audience ? (
                    <>
                      <div className="text-sm line-clamp-2">{scenario.target.audience}</div>
                      <p className="text-xs text-muted-foreground mt-1">Primary audience</p>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium">Not Specified</div>
                      <p className="text-xs text-muted-foreground">Add target audience in settings</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Channels</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {scenario.channels && scenario.channels.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-1">
                        {scenario.channels.map(channel => (
                          <Badge key={channel} variant="outline" className="capitalize">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Marketing channels</p>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium">None</div>
                      <p className="text-xs text-muted-foreground">No channels defined</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <Button>Create New Task</Button>
              </CardHeader>
              <CardContent>
                {scenarioTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tasks created yet</p>
                    <p className="text-sm">Create tasks to track work for this scenario</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scenarioTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="border rounded-md p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      >
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          {task.dueDate && (
                            <div className="text-sm text-muted-foreground">
                              <Calendar size={14} className="inline mr-1" />
                              {task.dueDate}
                            </div>
                          )}
                          <Badge className={
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-amber-100 text-amber-800' :
                            task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="connections" className="mt-6">
            <ScenarioConnectionsPanel scenarioId={id!} />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Edit Modal */}
      {showEditModal && (
        <EditScenarioModal
          scenario={scenario}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default ScenarioDetailPage;