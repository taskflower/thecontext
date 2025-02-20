// src/components/documents/ContainerActions.tsx
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal, FileText, Link2 } from "lucide-react";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";

interface ContainerActionsProps {
  containerId: string;
  onDelete: (containerId: string) => void;
}

const ContainerActions = ({ containerId, onDelete }: ContainerActionsProps) => {
  const adminNavigate = useAdminNavigate();

  return (
    <div className="flex gap-2 justify-between">
      <div className="flex gap-2">
        <Button
          size="sm"
          className="gap-2"
          onClick={() => adminNavigate(`/documents/${containerId}`)}
        >
          <FileText className="h-4 w-4" />
          <Trans>View Documents</Trans>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => adminNavigate(`/documents/${containerId}/relations`)}
        >
          <Link2 className="h-4 w-4" />
          <Trans>Relations</Trans>
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">
              <Trans>Open menu</Trans>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => adminNavigate(`/documents/${containerId}/edit`)}
          >
            <Trans>Edit</Trans>
          </DropdownMenuItem>
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
                    This action cannot be undone. This will permanently delete
                    this container and all its documents.
                  </Trans>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Trans>Cancel</Trans>
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(containerId)}>
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

export default ContainerActions;