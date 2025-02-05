import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2, Plus, Info, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { useState } from "react";
import { useDocumentsStore } from "@/store/documentsStore";
import { useKanbanStore } from "@/store/kanbanStore";
import { useTasksStore } from "@/store/tasksStore";

export const Settings = () => {
  const navigate = useNavigate();
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Get reset actions from stores
  const resetDocuments = useDocumentsStore(state => state.reset);
  const resetKanban = useKanbanStore(state => state.reset);
  const resetTasks = useTasksStore(state => state.reset);

  const handleDataReset = () => {
    // Reset all stores
    resetDocuments();
    resetKanban();
    resetTasks();
    
    // Clear localStorage
    localStorage.removeItem('documents-storage');
    localStorage.removeItem('kanban-storage');
    localStorage.removeItem('templates');
    
    // Show success message
    setResetSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex">
            Settings
          </h2>
          <p className="text-muted-foreground flex items-center gap-1">
            <Info className="h-5 w-5 stroke-1" /> Manage your app settings
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button className="gap-2" onClick={() => navigate("new")}>
            <Plus className="h-4 w-4" />
            Save settings
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter settings..."
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

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all your stored data including:
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
            <Alert className="mt-4 bg-green-50">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                All data has been successfully reset. You may need to refresh the page to see all changes.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;