import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, FileText, ListTodo, Route } from "lucide-react"; // Import ikon Lucide

export const AdminSidebar = () => {
  return (
    <div className="h-screen w-64 border-r bg-background sticky top-0">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-17 px-4 text-lg font-semibold">&nbsp;</h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/admin/boards/instances">
                <Route className="mr-2 h-5 w-5" /> Boards
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/admin/tasks/templates">
                <ListTodo className="mr-2 h-5 w-5" /> Tasks
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/admin/documents">
                <FileText className="mr-2 h-5 w-5" /> Documents
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/admin/settings">
                <Settings className="mr-2 h-5 w-5" /> Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
