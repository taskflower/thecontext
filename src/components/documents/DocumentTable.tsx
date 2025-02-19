import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, MoveUp, MoveDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trans } from "@lingui/macro";
import { truncate } from "@/services/utils";

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

const DocumentActions = ({
  document,
  index,
  totalDocuments,
  onPreview,
  onEdit,
  onMove,
  onDelete,
  showContainer,
}: {
  document: Document;
  index: number;
  totalDocuments: number;
  onPreview: (document: Document) => void;
  onEdit: (documentId: string) => void;
  onMove: (documentId: string, direction: "up" | "down") => void;
  onDelete: (documentId: string) => void;
  showContainer?: boolean;
}) => {
  return (
    <div className="flex gap-2 justify-end">
      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={() => onPreview(document)}
      >
        <Eye className="h-4 w-4" />
        <Trans>Preview</Trans>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(document.id)}>
            <Trans>Edit</Trans>
          </DropdownMenuItem>
          {!showContainer && (
            <>
              <DropdownMenuItem
                onClick={() => onMove(document.id, "up")}
                disabled={index === 0}
              >
                <MoveUp className="mr-2 h-4 w-4" />
                <Trans>Move Up</Trans>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onMove(document.id, "down")}
                disabled={index === totalDocuments - 1}
              >
                <MoveDown className="mr-2 h-4 w-4" />
                <Trans>Move Down</Trans>
              </DropdownMenuItem>
            </>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive"
              >
                <Trans>Delete</Trans>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <Trans>Are you sure?</Trans>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <Trans>
                    This action cannot be undone and will permanently delete the
                    document.
                  </Trans>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Trans>Cancel</Trans>
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(document.id)}>
                  <Trans>Delete</Trans>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const DocumentTable = ({
  documents,
  onPreview,
  onEdit,
  onMove,
  onDelete,
  showContainer = false,
}: DocumentTableProps) => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell className="w-[30px] p-3 py-4">
              <Checkbox />
            </TableCell>
            <TableCell className="px-3">
              <Trans>Title</Trans>
            </TableCell>
            {showContainer && (
              <TableCell className="px-3">
                <Trans>Container</Trans>
              </TableCell>
            )}
            <TableCell className="hidden md:table-cell px-3">
              <Trans>Content Preview</Trans>
            </TableCell>
            <TableCell className="w-[150px] px-3"></TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document, index) => (
            <TableRow key={document.id}>
              <TableCell className="px-3">
                <Checkbox />
              </TableCell>
              <TableCell className="px-3">
                <div className="flex space-x-2">
                  <span className="max-w-[500px] truncate font-medium">
                    {document.title}
                  </span>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell px-3">
                <span className="text-muted-foreground">
                  {document.content ? (
                    truncate(document.content, 32)
                  ) : (
                    <span className="italic text-muted-foreground">
                      <Trans>No content provided</Trans>
                    </span>
                  )}
                </span>
              </TableCell>
              <TableCell className="px-3">
                <DocumentActions
                  document={document}
                  index={index}
                  totalDocuments={documents.length}
                  onPreview={onPreview}
                  onEdit={onEdit}
                  onMove={onMove}
                  onDelete={onDelete}
                  showContainer={showContainer}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default DocumentTable;
