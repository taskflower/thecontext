// src/pages/projects/ProjectListPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectStore } from '@/store/projectStore';
import { formatDistanceToNow } from 'date-fns';

const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const projects = useProjectStore((state) => state.projects);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  
  const handleCreateNew = () => {
    navigate('/projects/setup');
  };
  
  const handleSelectProject = (projectId: string) => {
    setCurrentProject(projectId);
    navigate(`/projects/${projectId}`);
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={handleCreateNew}>Create New Project</Button>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4">No Projects Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start by creating your first project
          </p>
          <Button onClick={handleCreateNew}>Create a Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectProject(project.id)}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">{project.description || 'No description'}</p>
                <div className="mt-4 text-sm">
                  <p>Created: {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</p>
                  {project.updatedAt && (
                    <p>Updated: {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between w-full">
                  <span className="text-sm">{project.containers.length} containers</span>
                  <span className="text-sm">{project.setupCompleted ? 'Completed' : 'In setup'}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;
