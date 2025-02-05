import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Trash2, Database, Container } from "lucide-react";
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
import { useDocumentsStore } from "@/store/documentsStore";
import { useKanbanStore } from "@/store/kanbanStore";
import { useTasksStore } from "@/store/tasksStore";

export const DataManagement = () => {
  const [resetSuccess, setResetSuccess] = useState(false);

  const resetDocuments = useDocumentsStore((state) => state.reset);
  const resetKanban = useKanbanStore((state) => state.reset);
  const resetTasks = useTasksStore((state) => state.reset);

  const handleDataReset = () => {
    resetDocuments();
    resetKanban();
    resetTasks();
    localStorage.removeItem("documents-storage");
    localStorage.removeItem("kanban-storage");
    localStorage.removeItem("templates");
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-8 w-8" />
            <div>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your local application data
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-secondary/50 border-secondary">
          <AlertTitle className="font-medium flex items-center gap-2">
            <Container className="h-4 w-4" />
            Local Storage
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground mt-1">
            Your data is stored locally in your browser
          </AlertDescription>
        </Alert>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2 w-full">
              <Trash2 className="h-4 w-4" />
              Reset All Data!
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete all your stored data
                including:
                <ul className="list-disc ml-6 mt-2">
                  <li>All documents and containers</li>
                  <li>All Kanban boards and instances</li>
                  <li>All task templates</li>
                </ul>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDataReset}>
                Yes, delete everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {resetSuccess && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              All data has been successfully reset. You may need to refresh the
              page to see all changes.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
