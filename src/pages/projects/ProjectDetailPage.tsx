// src/pages/projects/ProjectDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProjectStore } from '@/store/projectStore';
import { useDocumentStore } from '@/store/documentStore';
import { useTaskStore } from '@/store/taskStore';
import { IProjectStats } from '@/utils/projects/projectTypes';


const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const project = useProjectStore((state) => 
    state.projects.find(p => p.id === projectId)
  );
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const removeProject = useProjectStore((state) => state.removeProject);
  
  const [stats, setStats] = useState<IProjectStats>({
    totalContainers: 0,
    totalDocuments: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    failedTasks: 0
  });
  
  // Load project and calculate stats
  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
      calculateProjectStats();
    }
  }, [projectId]);
  
  const calculateProjectStats = () => {
    if (!project) return;
    
    // Calculate container and document stats
    const { containers } = useDocumentStore.getState();
    const projectContainers = containers.filter(c => project.containers.includes(c.id));
    const totalDocuments = projectContainers.reduce((sum, container) => 
      sum + container.documents.length, 0);
    
    // Calculate task stats
    const { tasks } = useTaskStore.getState();
    const projectTasks = tasks.filter(task => 
      projectContainers.some(container => container.id === task.containerId)
    );
    
    setStats({
      totalContainers: projectContainers.length,
      totalDocuments,
      totalTasks: projectTasks.length,
      completedTasks: projectTasks.filter(t => t.status === 'completed').length,
      pendingTasks: projectTasks.filter(t => t.status === 'pending').length,
      inProgressTasks: projectTasks.filter(t => t.status === 'in_progress').length,
      failedTasks: projectTasks.filter(t => t.status === 'failed').length
    });
  };
  
  const handleDeleteProject = () => {
    if (projectId && confirm('Are you sure you want to delete this project?')) {
      removeProject(projectId);
      navigate('/projects');
    }
  };
  
  const handleSetupProject = () => {
    navigate('/projects/setup');
  };
  
  if (!project) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <Button onClick={() => navigate('/projects')}>Return to Projects</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSetupProject}>
            Edit Project
          </Button>
          <Button variant="destructive" onClick={handleDeleteProject}>
            Delete Project
          </Button>
        </div>
      </div>
      
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-1">Containers</h3>
          <p className="text-3xl font-bold">{stats.totalContainers}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-1">Documents</h3>
          <p className="text-3xl font-bold">{stats.totalDocuments}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-1">Tasks</h3>
          <p className="text-3xl font-bold">{stats.totalTasks}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-1">Completed</h3>
          <p className="text-3xl font-bold">
            {stats.totalTasks > 0 
              ? `${stats.completedTasks} (${Math.round(stats.completedTasks / stats.totalTasks * 100)}%)` 
              : '0'}
          </p>
        </div>
      </div>
      
      {/* Project Content Tabs */}
      <Tabs defaultValue="containers">
        <TabsList className="mb-4">
          <TabsTrigger value="containers">Containers</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="containers" className="bg-card p-6 rounded-lg border">
          {stats.totalContainers === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No containers in this project</p>
              <Button onClick={handleSetupProject}>Add Containers</Button>
            </div>
          ) : (
            <div>
              {/* Container list would go here */}
              <p>Container list placeholder</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tasks" className="bg-card p-6 rounded-lg border">
          {stats.totalTasks === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No tasks in this project</p>
              <Button>Create Task</Button>
            </div>
          ) : (
            <div>
              {/* Task list would go here */}
              <p>Task list placeholder</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="templates" className="bg-card p-6 rounded-lg border">
          {project.templates.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No templates associated with this project</p>
              <Button>Add Templates</Button>
            </div>
          ) : (
            <div>
              {/* Template list would go here */}
              <p>Template list placeholder</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailPage;