// src/pages/projects/ProjectList.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Settings2 } from "lucide-react";
import { useProjectsStore } from "@/store/projectsStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { SearchInput } from "@/components/common/SearchInput";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans, t } from "@lingui/macro";
import { useState } from "react";
import { truncate } from "@/services/utils";

export const ProjectList = () => {
  const { projects, removeProject } = useProjectsStore();
  const adminNavigate = useAdminNavigate();
  const [filter, setFilter] = useState("");

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(filter.toLowerCase()) ||
      project.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <AdminOutletTemplate
      title={<Trans>Projects</Trans>}
      description={<Trans>Manage your projects and their settings</Trans>}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            <Trans>View</Trans>
          </Button>
          <Button
            className="gap-2"
            onClick={() => adminNavigate("/projects/new")}
          >
            <Plus className="h-4 w-4" />
            <Trans>New Project</Trans>
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <SearchInput
          value={filter}
          onChange={setFilter}
          placeholder={t`Search projects...`}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="w-[300px]"><Trans>Title</Trans></TableCell>
                  <TableCell className="hidden md:table-cell"><Trans>Description</Trans></TableCell>
                  <TableCell className="w-[100px]"></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {truncate(project.title, 40)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {project.description ? (
                        truncate(project.description, 100)
                      ) : (
                        <span className="italic text-muted-foreground">
                          <Trans>No description provided</Trans>
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => adminNavigate(`/projects/${project.id}`)}
                        >
                          <Trans>View</Trans>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => adminNavigate(`/projects/${project.id}/edit`)}
                        >
                          <Trans>Edit</Trans>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(project.id)}
                        >
                          <Trans>Delete</Trans>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminOutletTemplate>
  );
};

export default ProjectList;

