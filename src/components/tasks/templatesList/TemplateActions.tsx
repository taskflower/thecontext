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
import { MoreHorizontal, Play } from "lucide-react";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";

interface TemplateActionsProps {
  templateId: string;
  onDelete: (templateId: string) => void;
}

const TemplateActions = ({ templateId, onDelete }: TemplateActionsProps) => {
  const adminNavigate = useAdminNavigate();

  return (
    <div className="flex gap-2 justify-end">
      <Button
        size="sm"
        className="gap-2"
        onClick={() => adminNavigate(`/tasks/templates/${templateId}/run`)}
      >
        <Play className="h-4 w-4" />
        Run
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => adminNavigate(`/tasks/templates/${templateId}/edit`)}
          >
            Edit
          </DropdownMenuItem>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Czy na pewno?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ta akcja jest nieodwracalna i usunie szablon na stałe.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(templateId)}>
                  Usuń
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TemplateActions;
