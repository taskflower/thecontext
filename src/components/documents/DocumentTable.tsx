import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, MoveUp, MoveDown, Trash2 } from "lucide-react";
import { Trans, t } from "@lingui/macro";

interface Document {
  id: string;
  title: string;
  content: string;
  containerName?: string;
}

interface DocumentTableProps {
  documents: Document[];
  onPreview: (document: Document) => void;
  onEdit: (documentId: string) => void;
  onMove: (documentId: string, direction: "up" | "down") => void;
  onDelete: (documentId: string) => void;
  showContainer?: boolean;
}

export const DocumentTable = ({
  documents,
  onPreview,
  onEdit,
  onMove,
  onDelete,
  showContainer = false,
}: DocumentTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[30px] p-6">
            <Checkbox />
          </TableHead>
          <TableHead className="px-6">
            <Trans>Title</Trans>
          </TableHead>
          {showContainer && (
            <TableHead className="px-6">
              <Trans>Container</Trans>
            </TableHead>
          )}
          <TableHead className="px-6">
            <Trans>Content Preview</Trans>
          </TableHead>
          <TableHead className="w-[250px] px-6"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document, index) => (
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
            {showContainer && (
              <TableCell className="px-6">
                <span className="text-muted-foreground">
                  {document.containerName}
                </span>
              </TableCell>
            )}
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
                  onClick={() => onPreview(document)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(document.id)}
                >
                  <Trans>Edit</Trans>
                </Button>
                {!showContainer && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMove(document.id, "up")}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMove(document.id, "down")}
                      disabled={index === documents.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        t`Are you sure you want to delete this document?`
                      )
                    ) {
                      onDelete(document.id);
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
  );
};
