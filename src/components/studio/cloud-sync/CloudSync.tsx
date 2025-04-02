/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/studio/cloud-sync/CloudSync.tsx
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudUpload, CloudDownload, HardDrive } from "lucide-react";
import { workspaceService } from "@/services/WorkspaceService";
import { useAppStore } from "@/modules/store";
import { useAuth } from "@/context/AuthContext";
import { ConfirmationModal } from "./ConfirmationModal";
import SaveTab from "./SaveTab";
import LoadTab from "./LoadTab";
import LocalFilesTab from "./LocalFilesTab";
import NotificationAlert from "./NotificationAlert";
import { ConfirmationData, createConfirmation, initialConfirmationState } from "./confirmationUtils";
import { validateWorkspace, replaceWorkspace, addWorkspace } from "./workspaceUtils";


type CloudSyncProps = unknown;

export const CloudSync: React.FC<CloudSyncProps> = () => {
  // App state
  const state = useAppStore();
  const currentWorkspace = state.getCurrentWorkspace();
  const { currentUser } = useAuth();

  // States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [cloudSuccess, setCloudSuccess] = useState<string | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [cloudWorkspaces, setCloudWorkspaces] = useState<any[]>([]);

  // Confirmation dialog state
  const [confirmation, setConfirmation] = useState<ConfirmationData>(initialConfirmationState);

  // Load cloud workspaces on initial render
  useEffect(() => {
    if (currentUser && cloudWorkspaces.length === 0) {
      handleLoadFromFirebase();
    }
  }, [currentUser]);

  // Confirmation dialog handlers
  const handleShowConfirmation = (
    title: string,
    message: string,
    action: () => void
  ) => {
    setConfirmation(createConfirmation(title, message, action));
  };

  const handleConfirmationClose = () => {
    setConfirmation({ ...confirmation, isVisible: false });
  };

  const handleConfirmationConfirm = () => {
    confirmation.action();
    setConfirmation({ ...confirmation, isVisible: false });
  };

  // Save current workspace to Firebase
  const handleSaveToFirebase = () => {
    if (!currentUser) {
      setCloudError("You must be logged in to save a workspace");
      return;
    }

    if (!currentWorkspace) {
      setCloudError("No workspace selected to save");
      return;
    }

    // Check if workspace with this ID already exists in the cloud
    const existsInCloud = cloudWorkspaces.some(
      (w) => w.id === currentWorkspace.id
    );
    const confirmMessage = existsInCloud
      ? `Workspace "${currentWorkspace.title}" already exists in the cloud. Do you want to overwrite it?`
      : `This operation will save a copy of the current workspace to Firebase. Continue?`;

    handleShowConfirmation("Save to Firebase", confirmMessage, async () => {
      try {
        setIsLoading(true);
        setCloudError(null);
        setCloudSuccess(null);

        // Save workspace to Firebase
        await workspaceService.saveWorkspace(currentWorkspace, currentUser.uid);

        const actionMsg = existsInCloud ? "updated" : "saved";
        setCloudSuccess(
          `Workspace "${currentWorkspace.title}" has been ${actionMsg} in Firebase`
        );

        // Refresh the list of workspaces in the cloud
        await handleLoadFromFirebase();
      } catch (error) {
        console.error("Error saving workspace:", error);
        setCloudError(
          "Failed to save workspace: " +
            (error instanceof Error ? error.message : String(error))
        );
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Load workspaces from Firebase
  const handleLoadFromFirebase = async () => {
    if (!currentUser) {
      setCloudError("You must be logged in to load workspaces");
      return;
    }

    try {
      setIsLoading(true);
      setCloudError(null);
      setCloudSuccess(null);

      // Get workspaces from Firebase - without full content for optimization
      const userWorkspaces = await workspaceService.getUserWorkspaces(
        currentUser.uid,
        { withContent: false }
      );

      console.log(`Received ${userWorkspaces.length} workspaces in CloudSync`);

      // Map the retrieved data to the view model
      const mappedWorkspaces = userWorkspaces.map((w) => ({
        id: w.id,
        title: w.title || "Untitled Workspace",
        description: w.description || "",
        updatedAt: w.updatedAt || Date.now(),
        createdAt: w.createdAt || Date.now(),
      }));

      console.log(`Mapped ${mappedWorkspaces.length} workspaces in CloudSync`);
      setCloudWorkspaces(mappedWorkspaces);

      if (userWorkspaces.length === 0) {
        setCloudSuccess("No workspaces found in Firebase");
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setCloudError(
        "Failed to fetch workspaces: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load a selected workspace
  const handleLoadSelectedWorkspace = () => {
    if (!selectedWorkspaceId) {
      setCloudError("Please select a workspace to load");
      return;
    }

    const selectedWorkspace = cloudWorkspaces.find(
      (w) => w.id === selectedWorkspaceId
    );
    if (!selectedWorkspace) {
      setCloudError("Cannot find the selected workspace");
      return;
    }

    // Check if workspace with this ID already exists locally
    const existingWorkspace = state.items.find(
      (w) => w.id === selectedWorkspaceId
    );

    const confirmMessage = existingWorkspace
      ? `Workspace "${selectedWorkspace.title}" already exists locally. Loading will replace the local version. Continue?`
      : `This operation will load workspace "${selectedWorkspace.title}" from Firebase. Continue?`;

    handleShowConfirmation("Load from Firebase", confirmMessage, async () => {
      try {
        setIsLoading(true);
        setCloudError(null);
        setCloudSuccess(null);

        if (!currentUser) {
          throw new Error("Current user is not logged in");
        }

        // Get workspace from Firebase
        const workspace = await workspaceService.getWorkspace(
          selectedWorkspaceId,
          currentUser.uid
        );

        if (!workspace) {
          throw new Error("Cannot load workspace data");
        }

        // Validate and ensure workspace has children array
        const validWorkspace = validateWorkspace(workspace);

        console.log(
          `[DEBUG] Loaded workspace with ${validWorkspace.children.length} scenarios`
        );

        if (existingWorkspace) {
          // If workspace with this ID already exists, replace it
          console.log(
            `[DEBUG] Replacing existing workspace (id: ${existingWorkspace.id})`
          );
          replaceWorkspace(validWorkspace, existingWorkspace.id);
          setCloudSuccess(
            `Workspace '${validWorkspace.title}' has been updated locally with ${validWorkspace.children.length} scenarios`
          );
        } else {
          // If workspace with this ID doesn't exist, add it as new
          console.log(`[DEBUG] Adding new workspace (id: ${validWorkspace.id})`);
          addWorkspace(validWorkspace);
          setCloudSuccess(
            `Successfully loaded workspace '${validWorkspace.title}' with ${validWorkspace.children.length} scenarios`
          );
        }
      } catch (error) {
        console.error("Error loading workspace:", error);
        setCloudError(
          "Failed to load workspace: " +
            (error instanceof Error ? error.message : String(error))
        );
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Handle error and success notifications for LocalFiles tab
  const handleLocalFilesError = (message: string) => {
    setCloudError(message);
    setCloudSuccess(null);
  };

  const handleLocalFilesSuccess = (message: string) => {
    setCloudSuccess(message);
    setCloudError(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col py-2 px-4">
        <Tabs defaultValue="save" className="w-full flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="save">
              <CloudUpload className="h-4 w-4 mr-2" /> Save to Cloud
            </TabsTrigger>
            <TabsTrigger value="load">
              <CloudDownload className="h-4 w-4 mr-2" /> Load from Cloud
            </TabsTrigger>
            <TabsTrigger value="local">
              <HardDrive className="h-4 w-4 mr-2" /> Local Files
            </TabsTrigger>
          </TabsList>

          {/* SAVE TAB */}
          <TabsContent value="save" className="flex-1 flex flex-col space-y-4">
            {!currentUser ? (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  You need to log in to use the Firebase backup and restore
                  functionality.
                </AlertDescription>
              </Alert>
            ) : (
              <SaveTab
                currentWorkspace={currentWorkspace}
                isLoading={isLoading}
                existsInCloud={cloudWorkspaces.some(
                  (w) => w.id === currentWorkspace?.id
                )}
                onSave={handleSaveToFirebase}
              />
            )}
          </TabsContent>

          {/* LOAD TAB */}
          <TabsContent value="load" className="flex-1 flex flex-col">
            {!currentUser ? (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  You need to log in to use the Firebase backup and restore
                  functionality.
                </AlertDescription>
              </Alert>
            ) : (
              <LoadTab
                cloudWorkspaces={cloudWorkspaces}
                selectedWorkspaceId={selectedWorkspaceId}
                isLoading={isLoading}
                onSelectWorkspace={setSelectedWorkspaceId}
                onLoadWorkspace={handleLoadSelectedWorkspace}
                onRefresh={handleLoadFromFirebase}
              />
            )}
          </TabsContent>

          {/* LOCAL FILES TAB */}
          <TabsContent value="local" className="flex-1 flex flex-col">
            <LocalFilesTab
              currentWorkspace={currentWorkspace}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              onError={handleLocalFilesError}
              onSuccess={handleLocalFilesSuccess}
            />
          </TabsContent>
        </Tabs>

        {/* Notifications */}
        <NotificationAlert
          type="error"
          title="Error"
          message={cloudError}
        />
        
        <NotificationAlert
          type="success"
          title="Success"
          message={cloudSuccess}
        />
      </div>

      {confirmation.isVisible && (
        <ConfirmationModal
          title={confirmation.title}
          message={confirmation.message}
          onConfirm={handleConfirmationConfirm}
          onCancel={handleConfirmationClose}
        />
      )}
    </div>
  );
};

export default CloudSync;