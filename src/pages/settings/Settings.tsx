// src/pages/settings/Settings.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { GoogleDriveIntegration } from "./GoogleDriveIntegration";
import { DataManagement } from "./DataManagement";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";

export const Settings = () => {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();

  return (
    <AdminOutletTemplate
      title="Settings"
      description="Manage your app settings"
      actions={
        <Button className="gap-2" onClick={() => navigate(`/admin/${lang}/users`)}>
          Users
        </Button>
      }
    >
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
    </AdminOutletTemplate>
  );
};

export default Settings;
