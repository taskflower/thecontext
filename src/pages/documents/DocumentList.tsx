// src/pages/documents/DocumentList.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings2, Plus, Info } from "lucide-react";
import { useDocumentsStore } from "@/store/documentsStore";
import { useNavigate } from "react-router-dom";

export const DocumentList = () => {
  const { containers } = useDocumentsStore();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex">
            Document Containers
          </h2>
          <p className="text-muted-foreground flex items-center gap-1">
            <Info className="h-5 w-5 stroke-1" /> Manage your document
            containers and their contents
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button className="gap-2" onClick={() => navigate("new")}>
            <Plus className="h-4 w-4" />
            New Container
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter containers..."
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            View
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px] p-6">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="px-6">Name</TableHead>
                  <TableHead className="px-6">Description</TableHead>
                  <TableHead className="w-[100px] px-6">Documents</TableHead>
                  <TableHead className="w-[100px] px-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((container) => (
                  <TableRow key={container.id}>
                    <TableCell className="px-6">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex space-x-2">
                        <span className="max-w-[500px] truncate font-medium">
                          {container.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <span className="text-muted-foreground">
                        {container.description}
                      </span>
                    </TableCell>
                    <TableCell className="px-6">
                      {
                        useDocumentsStore().getContainerDocuments(container.id)
                          .length
                      }
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/documents/${container.id}`)
                          }
                        >
                          View Documents
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/documents/${container.id}/edit`)
                          }
                        >
                          Edit
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
    </div>
  );
};
