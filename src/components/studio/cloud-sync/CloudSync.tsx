/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/studio/cloud-sync/CloudSync.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CloudUpload,
  CloudDownload,
  AlertCircle,
  Loader,
  RefreshCw,
  Calendar,
  Check,
  ShieldAlert,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workspace } from "@/modules/workspaces/types";
import { workspaceService } from "@/services/WorkspaceService";
import { useAppStore } from "@/modules/store";
import { useAuth } from "@/context/AuthContext";
import { ConfirmationModal } from "./ConfirmationModal";

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
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null
  );
  const [cloudWorkspaces, setCloudWorkspaces] = useState<any[]>([]);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmationAction, setConfirmationAction] = useState<() => void>(
    () => {}
  );
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [confirmationTitle, setConfirmationTitle] = useState<string>("");

  // Load cloud workspaces on initial render
  useEffect(() => {
    if (currentUser && cloudWorkspaces.length === 0) {
      handleLoadFromFirebase();
    }
  }, [currentUser]);

  // Handle workspace actions
  const handleWorkspaceAdded = (workspace: Workspace) => {
    console.log(
      "[DEBUG] handleWorkspaceAdded - workspace:",
      JSON.stringify(
        {
          id: workspace.id,
          title: workspace.title,
          childrenCount: workspace.children?.length || 0,
        },
        null,
        2
      )
    );

    if (!workspace.children) {
      console.warn(
        "[DEBUG] Children array doesn't exist, initializing as empty array"
      );
      workspace.children = [];
    }

    // Use set directly instead of addWorkspace
    useAppStore.setState((state) => {
      return {
        ...state,
        items: [...state.items, workspace],
        selected: {
          ...state.selected,
          workspace: workspace.id,
          scenario:
            workspace.children && workspace.children.length > 0
              ? workspace.children[0].id
              : "",
          node: "",
        },
        stateVersion: state.stateVersion + 1,
      };
    });

    console.log(
      "[DEBUG] Workspace added, number of scenarios:",
      workspace.children.length
    );
  };

  const handleWorkspaceReplaced = (
    workspace: Workspace,
    oldWorkspaceId: string
  ) => {
    console.log(
      "[DEBUG] handleWorkspaceReplaced - workspace:",
      JSON.stringify(
        {
          id: workspace.id,
          title: workspace.title,
          childrenCount: workspace.children?.length || 0,
        },
        null,
        2
      )
    );

    if (!workspace.children) {
      console.warn(
        "[DEBUG] Children array doesn't exist, initializing as empty array"
      );
      workspace.children = [];
    }

    // Use set directly instead of state methods
    useAppStore.setState((state) => {
      // First remove old workspace
      const filteredItems = state.items.filter(
        (item) => item.id !== oldWorkspaceId
      );

      // Then add new workspace
      return {
        ...state,
        items: [...filteredItems, workspace],
        selected: {
          ...state.selected,
          workspace: workspace.id,
          scenario:
            workspace.children && workspace.children.length > 0
              ? workspace.children[0].id
              : "",
          node: "",
        },
        stateVersion: state.stateVersion + 1,
      };
    });

    console.log(
      "[DEBUG] Workspace replaced, number of scenarios:",
      workspace.children.length
    );
  };

  // Confirmation dialog handlers
  const handleShowConfirmation = (
    title: string,
    message: string,
    action: () => void
  ) => {
    setConfirmationTitle(title);
    setConfirmationMessage(message);
    setConfirmationAction(() => action);
    setShowConfirmation(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  const handleConfirmationConfirm = () => {
    confirmationAction();
    setShowConfirmation(false);
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

        // Additional check if workspace contains children
        if (!workspace.children) {
          console.warn(
            "[DEBUG] Loaded workspace has no children array, initializing as empty array"
          );
          workspace.children = [];
        }

        console.log(
          `[DEBUG] Loaded workspace with ${workspace.children.length} scenarios`
        );

        if (existingWorkspace) {
          // If workspace with this ID already exists, replace it
          console.log(
            `[DEBUG] Replacing existing workspace (id: ${existingWorkspace.id})`
          );
          handleWorkspaceReplaced(workspace, existingWorkspace.id);
          setCloudSuccess(
            `Workspace '${workspace.title}' has been updated locally with ${workspace.children.length} scenarios`
          );
        } else {
          // If workspace with this ID doesn't exist, add it as new
          console.log(`[DEBUG] Adding new workspace (id: ${workspace.id})`);
          handleWorkspaceAdded(workspace);
          setCloudSuccess(
            `Successfully loaded workspace '${workspace.title}' with ${workspace.children.length} scenarios`
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

  // Format date
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="h-full flex flex-col">
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
        <div className="flex-1 flex flex-col py-2 px-4">
          <Tabs defaultValue="save" className="w-full flex-1 flex flex-col">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="save">
                <CloudUpload className="h-4 w-4 mr-2" /> Save to Cloud
              </TabsTrigger>
              <TabsTrigger value="load">
                <CloudDownload className="h-4 w-4 mr-2" /> Load from Cloud
              </TabsTrigger>
            </TabsList>

            {/* SAVE TAB */}
            <TabsContent
              value="save"
              className="flex-1 flex flex-col space-y-4"
            >
              {currentWorkspace ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="p-4 bg-secondary/30 rounded-md">
                    <p className="font-medium text-lg">
                      {currentWorkspace.title}
                    </p>

                    {currentWorkspace.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentWorkspace.description}
                      </p>
                    )}

                    {cloudWorkspaces.some(
                      (w) => w.id === currentWorkspace.id
                    ) && (
                      <div className="text-sm text-amber-600 mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-sm border border-amber-200 dark:border-amber-800">
                        This workspace already exists in the cloud and will be
                        overwritten
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    <Button
                      onClick={handleSaveToFirebase}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CloudUpload className="h-4 w-4 mr-2" />
                          Save to Firebase
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center py-6 text-muted-foreground">
                  <div>
                    <p>No workspace selected</p>
                    <p className="text-sm mt-1">
                      Select a workspace to save it to the cloud
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* LOAD TAB */}
            <TabsContent value="load" className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium">Cloud Workspaces</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadFromFirebase}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-1 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                </div>

                {isLoading && cloudWorkspaces.length === 0 ? (
                  <div className="flex-1 flex justify-center items-center py-6">
                    <Loader className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : cloudWorkspaces.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-center py-6 text-muted-foreground border border-dashed rounded-md">
                    <div>
                      <p>No workspaces found in Firebase</p>
                      <p className="text-sm mt-1">
                        Save a workspace to be able to load it later
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <ScrollArea className="flex-1 rounded-md border">
                      <div className="p-1">
                        {cloudWorkspaces.map((workspace) => (
                          <div
                            key={workspace.id}
                            onClick={() => setSelectedWorkspaceId(workspace.id)}
                            className={`p-3 rounded-md cursor-pointer transition-colors mb-1 ${
                              selectedWorkspaceId === workspace.id
                                ? "bg-secondary/50 border border-secondary"
                                : "hover:bg-secondary/20 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id={`workspace-${workspace.id}`}
                                name="workspace-selection"
                                checked={selectedWorkspaceId === workspace.id}
                                onChange={() =>
                                  setSelectedWorkspaceId(workspace.id)
                                }
                                className="mr-3"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                  <p className="font-medium">
                                    {workspace.title || "Untitled Workspace"}
                                  </p>
                                  {state.items.some(
                                    (w) => w.id === workspace.id
                                  ) && (
                                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-100 px-2 py-0.5 rounded-sm">
                                      Exists locally
                                    </span>
                                  )}
                                </div>

                                {workspace.description && (
                                  <p className="text-sm text-muted-foreground truncate mt-1">
                                    {workspace.description}
                                  </p>
                                )}

                                <div className="flex items-center text-xs text-muted-foreground mt-2">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(workspace.updatedAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Button
                      onClick={handleLoadSelectedWorkspace}
                      disabled={isLoading || !selectedWorkspaceId}
                      className="mt-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <CloudDownload className="h-4 w-4 mr-2" />
                          Load Selected Workspace
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Notifications */}
          {cloudError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{cloudError}</AlertDescription>
            </Alert>
          )}

          {cloudSuccess && (
            <Alert
              variant="default"
              className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-100 mt-4 border-green-200 dark:border-green-800"
            >
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{cloudSuccess}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {showConfirmation && (
        <ConfirmationModal
          title={confirmationTitle}
          message={confirmationMessage}
          onConfirm={handleConfirmationConfirm}
          onCancel={handleConfirmationClose}
        />
      )}
    </div>
  );
};

export default CloudSync;
