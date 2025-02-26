import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/projectStore';
import { formatDistanceToNow } from 'date-fns';
import { useAdminNavigate } from '@/hooks/useAdminNavigate';
import AdminOutletTemplate from '@/layouts/AdminOutletTemplate';

const ProjectListPage: React.FC = () => {
  const adminNavigate = useAdminNavigate();
  const projects = useProjectStore((state) => state.projects);
  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  
  const handleCreateNew = () => {
    adminNavigate('/projects/setup');
  };
  
  const handleSelectProject = (projectId: string) => {
    setCurrentProject(projectId);
    adminNavigate(`/projects/${projectId}`);
  };
  
  return (
    <AdminOutletTemplate
      title="Projects"
      description=""
      actions={
        <Button onClick={handleCreateNew}>Create New Project</Button>
      }
    >
    
    
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
            <Card 
              key={project.id} 
              className={`cursor-pointer transition-colors
                ${currentProject?.id === project.id 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-primary'}`}
              onClick={() => handleSelectProject(project.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{project.name}</CardTitle>
                  {currentProject?.id === project.id && (
                    <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </div>
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
   
    </AdminOutletTemplate>
  );
};

export default ProjectListPage;