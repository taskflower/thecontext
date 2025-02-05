import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2, Plus, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleDriveIntegration } from "./GoogleDriveIntegration";
import { DataManagement } from "./DataManagement";

export const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
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
          <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
            <Settings2 className="mr-2 h-4 w-4" />
            View
          </Button>
        </div>

        <div className="space-y-8">
          <GoogleDriveIntegration />
          <DataManagement />
        </div>
      </div>
    </div>
  );
};