/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/studio/exportImport/CloudTab.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CloudUpload, 
  CloudDownload, 
  AlertCircle,
  Loader
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Workspace } from "@/modules/workspaces/types";
import { workspaceService } from "@/services/WorkspaceService";


interface CloudTabProps {
  currentUser: any;
  currentWorkspace: Workspace | null;
  workspaces: Workspace[]; 
  showConfirmation: (title: string, message: string, action: () => void) => void;
  onWorkspaceAdded: (workspace: Workspace) => void;
  onWorkspaceReplaced: (workspace: Workspace, oldWorkspaceId: string) => void;
}

export const CloudTab: React.FC<CloudTabProps> = ({ 
  currentUser, 
  currentWorkspace,
  workspaces,
  showConfirmation,
  onWorkspaceAdded,
  onWorkspaceReplaced
}) => {
  // States
  const [cloudAction, setCloudAction] = useState<"save" | "load">("save");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [cloudSuccess, setCloudSuccess] = useState<string | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [cloudWorkspaces, setCloudWorkspaces] = useState<any[]>([]);

  // Save current workspace to Firebase
  const handleSaveToFirebase = () => {
    if (!currentUser) {
      setCloudError("Musisz być zalogowany, aby zapisać workspace");
      return;
    }

    if (!currentWorkspace) {
      setCloudError("Nie wybrano workspace'a do zapisania");
      return;
    }

    showConfirmation(
      "Zapisz do Firebase",
      "Ta operacja zapisze kopię bieżącego workspace'a do Firebase. Kontynuować?",
      async () => {
        try {
          setIsLoading(true);
          setCloudError(null);
          setCloudSuccess(null);

          // Zapisz workspace do Firebase
          await workspaceService.saveWorkspace(currentWorkspace, currentUser.uid);
          
          setCloudSuccess(`Workspace "${currentWorkspace.title}" został zapisany do Firebase`);
        } catch (error) {
          console.error("Błąd podczas zapisywania workspace:", error);
          setCloudError(
            "Nie udało się zapisać workspace'a: " +
              (error instanceof Error ? error.message : String(error))
          );
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  // Load workspaces from Firebase
  const handleLoadFromFirebase = async () => {
    if (!currentUser) {
      setCloudError("Musisz być zalogowany, aby wczytać workspace'y");
      return;
    }

    try {
      setIsLoading(true);
      setCloudError(null);
      setCloudSuccess(null);

      // Pobierz workspace'y z Firebase - bez pełnej zawartości dla optymalizacji
      const userWorkspaces = await workspaceService.getUserWorkspaces(currentUser.uid, { withContent: false });
      
      setCloudWorkspaces(userWorkspaces.map(w => ({
        id: w.id,
        title: w.title,
        description: w.description,
        updatedAt: w.updatedAt,
        createdAt: w.createdAt
      })));

      if (userWorkspaces.length === 0) {
        setCloudSuccess("Nie znaleziono workspace'ów w Firebase");
      }
    } catch (error) {
      console.error("Błąd podczas pobierania workspace'ów:", error);
      setCloudError(
        "Nie udało się pobrać workspace'ów: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load a selected workspace
  const handleLoadSelectedWorkspace = () => {
    if (!selectedWorkspaceId) {
      setCloudError("Wybierz workspace do wczytania");
      return;
    }

    showConfirmation(
      "Wczytaj z Firebase",
      "Ta operacja wczyta wybrany workspace z Firebase. Jeśli workspace o tym ID już istnieje, zostanie usunięty i zastąpiony nowym. Kontynuować?",
      async () => {
        try {
          setIsLoading(true);
          setCloudError(null);
          setCloudSuccess(null);

          // Pobierz workspace z Firebase
          const workspace = await workspaceService.getWorkspace(
            selectedWorkspaceId,
            currentUser.uid
          );

          if (!workspace) {
            throw new Error("Nie można wczytać danych workspace'a");
          }

          // Sprawdź, czy workspace o takim ID już istnieje
          const existingWorkspace = workspaces.find(w => w.id === workspace.id);
          
          if (existingWorkspace) {
            // Jeżeli workspace o tym ID już istnieje, usuń go i dodaj nowy
            onWorkspaceReplaced(workspace, existingWorkspace.id);
            setCloudSuccess(`Workspace '${workspace.title}' został zaktualizowany`);
          } else {
            // Jeżeli workspace o tym ID nie istnieje, dodaj go jako nowy
            onWorkspaceAdded(workspace);
            setCloudSuccess(`Pomyślnie wczytano workspace '${workspace.title}'`);
          }
        } catch (error) {
          console.error("Błąd podczas wczytywania workspace'a:", error);
          setCloudError(
            "Nie udało się wczytać workspace'a: " +
              (error instanceof Error ? error.message : String(error))
          );
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  return (
    <>
      {!currentUser ? (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wymagane uwierzytelnienie</AlertTitle>
          <AlertDescription>
            Musisz się zalogować, aby korzystać z funkcji kopii zapasowej i przywracania Firebase.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader className="p-4">
              <RadioGroup
                value={cloudAction}
                onValueChange={(value) => setCloudAction(value as "save" | "load")}
                className="space-y-3"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="save" id="cloud-save" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="cloud-save" className="font-medium">
                      Zapisz do Firebase
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Zapisz bieżący workspace do Firebase
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="load" id="cloud-load" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="cloud-load" className="font-medium">
                      Wczytaj z Firebase
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Wczytaj swoje workspace'y z Firebase
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardHeader>
          </Card>

          {cloudAction === "save" ? (
            <Card>
              <CardHeader className="p-4">
                <h3 className="text-lg font-medium">Zapisz bieżący workspace do Firebase</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Ta operacja zapisze bieżący workspace do Firebase.
                </p>
                <div className="mt-4">
                  <Button
                    onClick={handleSaveToFirebase}
                    disabled={isLoading || !currentWorkspace}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Zapisywanie...
                      </>
                    ) : (
                      <>
                        <CloudUpload className="h-4 w-4 mr-2" />
                        Zapisz {currentWorkspace ? currentWorkspace.title : "workspace"}
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <CardHeader className="p-4">
                <h3 className="text-lg font-medium">Wczytaj workspace'y z Firebase</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Wybierz workspace do wczytania:
                </p>
                
                <div className="mt-4">
                  <Button
                    onClick={handleLoadFromFirebase}
                    disabled={isLoading}
                    className="w-full mb-4"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Wczytywanie...
                      </>
                    ) : (
                      <>
                        <CloudDownload className="h-4 w-4 mr-2" />
                        Pobierz workspace'y
                      </>
                    )}
                  </Button>

                  {cloudWorkspaces.length > 0 && (
                    <div className="mt-4 max-h-60 overflow-y-auto">
                      <div className="space-y-2">
                        {cloudWorkspaces.map((workspace) => (
                          <div
                            key={workspace.id}
                            className="flex items-center p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <input
                              type="radio"
                              id={`workspace-${workspace.id}`}
                              name="workspace-selection"
                              checked={selectedWorkspaceId === workspace.id}
                              onChange={() => setSelectedWorkspaceId(workspace.id)}
                              className="mr-2"
                            />
                            <Label
                              htmlFor={`workspace-${workspace.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <span className="font-medium">
                                {workspace.title || "Workspace bez nazwy"}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {workspace.description || "Brak opisu"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Zaktualizowano: {workspace.updatedAt ? new Date(workspace.updatedAt).toLocaleString() : "N/A"}
                              </p>
                            </Label>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        onClick={handleLoadSelectedWorkspace}
                        disabled={isLoading || !selectedWorkspaceId}
                        className="w-full mt-4"
                      >
                        {isLoading ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Wczytywanie...
                          </>
                        ) : (
                          <>
                            <CloudDownload className="h-4 w-4 mr-2" />
                            Wczytaj wybrany workspace
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          )}

          {cloudError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Błąd</AlertTitle>
              <AlertDescription>{cloudError}</AlertDescription>
            </Alert>
          )}

          {cloudSuccess && (
            <Alert className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 mt-4">
              <AlertTitle>Sukces</AlertTitle>
              <AlertDescription>{cloudSuccess}</AlertDescription>
            </Alert>
          )}
        </>
      )}
    </>
  );
};