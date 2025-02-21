// src/components/documents/container/ContainerDropdown.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { MoreHorizontal, FileText, Link2, Edit, Trash } from "lucide-react";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";

interface ContainerDropdownProps {
  containerId: string;
  onDelete: (containerId: string) => void;
}

const ContainerDropdown = ({ containerId, onDelete }: ContainerDropdownProps) => {
  const adminNavigate = useAdminNavigate();

  return (
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
        <DropdownMenuItem onClick={() => adminNavigate(`/documents/${containerId}`)}>
          <FileText className="h-4 w-4 mr-2" />
          <Trans>View Documents</Trans>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => adminNavigate(`/documents/${containerId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          <Trans>Edit conteiner</Trans>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => adminNavigate(`/documents/${containerId}/relations`)}>
          <Link2 className="h-4 w-4 mr-2" />
          <Trans>Relations</Trans>
        </DropdownMenuItem>
       
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
              <Trash className="h-4 w-4 mr-2" />
              <Trans>Delete container</Trans>
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <Trans>Are you sure?</Trans>
              </AlertDialogTitle>
              <AlertDialogDescription>
                <Trans>
                  This action cannot be undone. This will permanently delete this container and all its documents.
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
  );
};

export default ContainerDropdown;
