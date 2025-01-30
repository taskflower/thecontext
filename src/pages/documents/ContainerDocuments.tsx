import { useNavigate, useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Settings2, 
  ArrowLeft, 
  Trash2, 
  FilePlus, 
  MoveUp, 
  MoveDown,
  Eye 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MDEditor from '@uiw/react-md-editor';
import { useState } from "react";

export const ContainerDocuments = () => {
  const { containerId } = useParams();
  const navigate = useNavigate();
  const { 
    containers, 
    removeDocument, 
    getContainerDocuments,
    updateDocument 
  } = useDocumentsStore();
  
  const [filter, setFilter] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<{ title: string; content: string } | null>(null);
  
  const container = containers.find(c => c.id === containerId);
  const documents = getContainerDocuments(containerId || "");

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(filter.toLowerCase()) ||
    doc.content.toLowerCase().includes(filter.toLowerCase())
  );

  if (!container) {
    return <div>Container not found</div>;
  }

  const handleMoveDocument = (docId: string, direction: 'up' | 'down') => {
    const currentIndex = documents.findIndex(d => d.id === docId);
    if (direction === 'up' && currentIndex > 0) {
      const prevDoc = documents[currentIndex - 1];
      updateDocument(docId, { order: prevDoc.order });
      updateDocument(prevDoc.id, { order: documents[currentIndex].order });
    } else if (direction === 'down' && currentIndex < documents.length - 1) {
      const nextDoc = documents[currentIndex + 1];
      updateDocument(docId, { order: nextDoc.order });
      updateDocument(nextDoc.id, { order: documents[currentIndex].order });
    }
  };

  const handlePreview = (document: { title: string; content: string }) => {
    setSelectedDocument(document);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin/documents')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">
              {container.name}
            </h2>
          </div>
          <p className="text-muted-foreground">{container.description}</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            className="gap-2" 
            onClick={() => navigate(`/admin/documents/${containerId}/document/new`)}
          >
            <FilePlus className="h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter documents..."
            className="h-8 w-[150px] lg:w-[250px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
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
                  <TableHead className="px-6">Title</TableHead>
                  <TableHead className="px-6">Content Preview</TableHead>
                  <TableHead className="w-[250px] px-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document, index) => (
                  <TableRow key={document.id}>
                    <TableCell className="px-6">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex space-x-2">
                        <span className="max-w-[500px] truncate font-medium">
                          {document.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <span className="text-muted-foreground line-clamp-1">
                        {document.content}
                      </span>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(document)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/documents/${containerId}/document/${document.id}/edit`)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveDocument(document.id, 'up')}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveDocument(document.id, 'down')}
                          disabled={index === documents.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this document?')) {
                              removeDocument(document.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
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

      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
          </DialogHeader>
          <div data-color-mode="light">
            <MDEditor.Markdown 
              source={selectedDocument?.content || ''} 
              className="p-4 border rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};