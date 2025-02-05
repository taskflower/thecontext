import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HardDrive, Folder, Power, Activity } from "lucide-react";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import { useAuthState } from "@/hooks/useAuthState";
import ApiDocsDialog from "./ApiDocsDialog";

export const GoogleDriveIntegration = () => {
  const [apiDocsOpen, setApiDocsOpen] = useState(false);
  const { driveConnected, error, connectToDrive, resourcesDirId } = useGoogleDrive();
  const { user } = useAuthState();

  return (
    <Card className="border-0 md:border shadow-none md:shadow">
      <CardHeader className="px-0 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-8 w-8" />
            <div>
              <CardTitle>Google Drive Integration</CardTitle>
              <CardDescription>
                Manage your drive connection and resources
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={driveConnected ? "default" : "secondary"}>
              {driveConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApiDocsOpen(true)}
              disabled={!driveConnected}
            >
              <Activity className="mr-2 h-4 w-4" /> Drive actions
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-0 md:px-6">
        {driveConnected ? (
          <div className="space-y-4">
            <Alert className="bg-secondary/50 border-secondary">
              <AlertTitle className="font-medium flex items-center gap-2">
                <Power className="h-4 w-4" /> Active Connection
              </AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground mt-1">
                Connected as {user?.email}
              </AlertDescription>
            </Alert>

            {resourcesDirId && (
              <Alert className="bg-secondary/50 border-secondary">
                <AlertTitle className="font-medium flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Resources Directory
                </AlertTitle>
                <AlertDescription className="text-sm text-muted-foreground mt-1">
                  Directory 'theContextResources' is configured
                  <div className="text-xs mt-1 font-mono">
                    ID: {resourcesDirId}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert variant="destructive" className="bg-destructive/5">
              <AlertTitle>Not Connected</AlertTitle>
              <AlertDescription>
                Connect your Google Drive account to enable resource management
              </AlertDescription>
            </Alert>
            <Button onClick={connectToDrive} className="w-full">
              Connect Google Drive
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <ApiDocsDialog 
        open={apiDocsOpen} 
        onOpenChange={setApiDocsOpen}
        resourcesDirId={resourcesDirId}
      />
    </Card>
  );
};