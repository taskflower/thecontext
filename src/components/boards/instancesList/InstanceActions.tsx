// src/components/boards/instancesList/InstanceActions.tsx
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
import { MoreHorizontal } from "lucide-react";
import { Trans } from "@lingui/macro";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";

interface InstanceActionsProps {
  instanceId: string;
  onDelete: (instanceId: string) => void;
}

const InstanceActions = ({ instanceId, onDelete }: InstanceActionsProps) => {
  const adminNavigate = useAdminNavigate();

  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={() => adminNavigate(`/boards/${instanceId}/view`)}
      >
        <Trans>Open</Trans>
      </Button>
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
            onClick={() => adminNavigate(`/boards/templates`)}
          >
            <Trans>Templates</Trans>
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
                    This action cannot be undone. This will permanently delete your board and remove all tasks.
                  </Trans>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel><Trans>Cancel</Trans></AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(instanceId)}>
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

export default InstanceActions;