// src/pages/projects/ProjectNew.tsx
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useProjectsStore } from "@/store/projectsStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";

import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";
import { ProjectForm } from "./ProjectForm";

export const ProjectNew = () => {
  const adminNavigate = useAdminNavigate();
  const { addProject } = useProjectsStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    settings: {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject(formData);
    adminNavigate("/projects");
  };

  return (
    <AdminOutletTemplate
      title={<Trans>New Project</Trans>}
      description={<Trans>Create a new project</Trans>}
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

export default ProjectNew;


