// src/pages/projects/ProjectDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { suggestNextSteps } from '@/utils/api/projectAI';


const ProjectDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentProject = useProjectStore((state) => state.currentProject);
  const projects = useProjectStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  useEffect(() => {
    if (currentProject) {
      loadRecentTasks();
      fetchRecommendations();
    }
  }, [currentProject]);
  
  const loadRecentTasks = () => {
    if (!currentProject) return;
    
    // Get tasks for the current project
    const projectTasks = tasks.filter(task => 
      currentProject.containers.includes(task.containerId || '')
    );
    
    // Sort by updated date
    const sorted = [...projectTasks].sort((a, b) => 
      new Date(b.updatedAt || b.createdAt).getTime() - 
      new Date(a.updatedAt || a.createdAt).getTime()
    );
    
    setRecentTasks(sorted.slice(0, 5));
  };
  
  const fetchRecommendations = async () => {
    if (!currentProject) return;
    
    // Count completed and pending tasks
    const projectTasks = tasks.filter(task => 
      currentProject.containers.includes(task.containerId || '')
    );
    
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const pendingTasks = projectTasks.filter(t => t.status === 'pending').length;
    
    // Get recommendations from AI
    const steps = await suggestNextSteps(
      currentProject.id,
      completedTasks,
      pendingTasks
    );
    
    setRecommendations(steps);
  };
  
  const handleSelectProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };
  
  if (!currentProject && projects.length > 0) {
    // Automatically set first project as current if none selected
    useProjectStore.getState().setCurrentProject(projects[0].id);
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Dashboard</h1>
        <Button onClick={() => navigate('/projects/setup')}>New Project</Button>
      </div>
      
      {!currentProject ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4">No Projects Available</h2>
          <p className="text-muted-foreground mb-6">
            Create a project to get started
          </p>
          <Button onClick={() => navigate('/projects/setup')}>Create a Project</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Project */}
          <Card>
            <CardHeader>
              <CardTitle>Current Project: {currentProject.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{currentProject.description || 'No description'}</p>
              <div className="flex space-x-2 mt-4">
                <Button onClick={() => navigate(`/projects/${currentProject.id}`)}>
                  View Details
                </Button>
                <Button variant="outline" onClick={() => navigate('/tasks')}>
                  View Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTasks.length > 0 ? (
                  <ul className="space-y-2">
                    {recentTasks.map(task => (
                      <li key={task.id} className="border-b pb-2">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground flex justify-between">
                          <span>Status: {task.status}</span>
                          <span>Priority: {task.priority}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No tasks in this project yet
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {recommendations.map((recommendation, index) => (
                      <li key={index} className="border-b pb-2">
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    Loading recommendations...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Project Selector */}
          {projects.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Other Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {projects
                    .filter(p => p.id !== currentProject.id)
                    .map(project => (
                      <div 
                        key={project.id}
                        className="p-4 border rounded-md cursor-pointer hover:bg-muted"
                        onClick={() => handleSelectProject(project.id)}
                      >
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {project.description || 'No description'}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDashboardPage;