// Step1ProjectSelection.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useProjectStore } from "@/store/projectStore";

export const Step1ProjectSelection: React.FC = () => {
  // Use project store directly
  const projects = useProjectStore((state) => state.projects);
  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const createProjectWithResources = useProjectStore((state) => state.createProjectWithResources);

  // Local state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);

  // Initialize with current project if exists
  useEffect(() => {
    if (currentProject) {
      setProjectId(currentProject.id);
      setProjectName(currentProject.name);
      setProjectDescription(currentProject.description || "");
    }
  }, [currentProject]);

  // Create new project
  const createProject = () => {
    if (!projectName.trim()) return null;
    
    const id = createProjectWithResources(
      projectName,
      projectDescription,
      [], // No initial containers
      []  // No initial templates
    );
    
    setCurrentProject(id);
    setProjectId(id);
    return id;
  };

  // Select existing project
  const handleSelectProject = (id: string) => {
    setProjectId(id);
    setCurrentProject(id);
    
    const project = projects.find(p => p.id === id);
    if (project) {
      setProjectName(project.name);
      setProjectDescription(project.description || "");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>
              Start by creating a new project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Name</label>
                <Input 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Project Description</label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Project Description"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={createProject}
              disabled={!projectName.trim()}
            >
              Create Project
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Existing Project</CardTitle>
            <CardDescription>
              Continue working with an existing project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <Select
                value={projectId || ""}
                onValueChange={handleSelectProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground">No projects available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};