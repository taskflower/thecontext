// DocumentActions.tsx
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trans } from "@lingui/macro";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, MoveUp, MoveDown } from "lucide-react";
import { Document } from "@/types/document";

interface DocumentActionsProps {
  document: Document;
  index: number;
  totalDocuments: number;
  onPreview: (document: Document) => void;
  onEdit: (documentId: string) => void;
  onMove: (documentId: string, direction: "up" | "down") => void;
  onDelete: (documentId: string) => void;
  showContainer?: boolean;
}

export const DocumentActions = ({
  document,
  index,
  totalDocuments,
  onPreview,
  onEdit,
  onMove,
  onDelete,
  showContainer,
}: DocumentActionsProps) => {
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