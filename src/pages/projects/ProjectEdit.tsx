// src/pages/projects/ProjectEdit.tsx
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useProjectsStore } from "@/store/projectsStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";

import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";
import { ProjectForm } from "./ProjectForm";

export const ProjectEdit = () => {
  const { id } = useParams();
  const adminNavigate = useAdminNavigate();
  const { projects, updateProject } = useProjectsStore();
  const project = projects.find((p) => p.id === id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    settings: {}
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        settings: project.settings
      });
    }
  }, [project]);

  if (!project) {
    return <div><Trans>Project not found</Trans></div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject(id!, formData);
    adminNavigate("/projects");
  };

  return (
    <AdminOutletTemplate
      title={<Trans>Edit Project</Trans>}
      description={<Trans>Modify project details and settings</Trans>}
      actions={
        <Button variant="outline" onClick={() => adminNavigate("/projects")}>
          <Trans>Back to Projects</Trans>
        </Button>
      }
    >
      <ProjectForm
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onCancel={() => adminNavigate("/projects")}
      />
    </AdminOutletTemplate>
  );
};

export default ProjectEdit;
