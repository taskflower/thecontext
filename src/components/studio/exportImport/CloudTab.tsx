/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/studio/exportImport/CloudTab.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CloudUpload,
  CloudDownload,
  AlertCircle,
  Loader,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Workspace } from "@/modules/workspaces/types";
import { workspaceService } from "@/services/WorkspaceService";

interface CloudTabProps {
  currentUser: any;
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  showConfirmation: (
    title: string,
    message: string,
    action: () => void
  ) => void;
  onWorkspaceAdded: (workspace: Workspace) => void;
  onWorkspaceReplaced: (workspace: Workspace, oldWorkspaceId: string) => void;
}

export const CloudTab: React.FC<CloudTabProps> = ({
  currentUser,
  currentWorkspace,
  workspaces,
  showConfirmation,
  onWorkspaceAdded,
  onWorkspaceReplaced,
}) => {
  // States
  const [cloudAction, setCloudAction] = useState<"save" | "load">("save");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [cloudSuccess, setCloudSuccess] = useState<string | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null
  );
  const [cloudWorkspaces, setCloudWorkspaces] = useState<any[]>([]);

  // Efekt do automatycznego ładowania workspace'ów przy zmianie akcji na "load"
  useEffect(() => {
    if (cloudAction === "load" && currentUser && cloudWorkspaces.length === 0) {
      handleLoadFromFirebase();
    }
  }, [cloudAction, currentUser]);

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

    // Sprawdź, czy workspace o tym ID już istnieje w chmurze
    const existsInCloud = cloudWorkspaces.some(
      (w) => w.id === currentWorkspace.id
    );
    const confirmMessage = existsInCloud
      ? `Workspace "${currentWorkspace.title}" już istnieje w chmurze. Czy chcesz go nadpisać?`
      : `Ta operacja zapisze kopię bieżącego workspace'a do Firebase. Kontynuować?`;

    showConfirmation("Zapisz do Firebase", confirmMessage, async () => {
      try {
        setIsLoading(true);
        setCloudError(null);
        setCloudSuccess(null);

        // Zapisz workspace do Firebase
        await workspaceService.saveWorkspace(currentWorkspace, currentUser.uid);

        const actionMsg = existsInCloud ? "zaktualizowany" : "zapisany";
        setCloudSuccess(
          `Workspace "${currentWorkspace.title}" został ${actionMsg} w Firebase`
        );

        // Odśwież listę workspace'ów w chmurze, jeśli jesteśmy na widoku load
        if (cloudAction === "load") {
          await handleLoadFromFirebase();
        }
      } catch (error) {
        console.error("Błąd podczas zapisywania workspace:", error);
        setCloudError(
          "Nie udało się zapisać workspace'a: " +
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
      setCloudError("Musisz być zalogowany, aby wczytać workspace'y");
      return;
    }

    try {
      setIsLoading(true);
      setCloudError(null);
      setCloudSuccess(null);

      // Pobierz workspace'y z Firebase - bez pełnej zawartości dla optymalizacji
      const userWorkspaces = await workspaceService.getUserWorkspaces(
        currentUser.uid,
        { withContent: false }
      );

      console.log(`Otrzymano ${userWorkspaces.length} workspace'ów w CloudTab`);
      
      // Mapuj pobrane dane do modelu widoku
      const mappedWorkspaces = userWorkspaces.map((w) => ({
        id: w.id,
        title: w.title || "Workspace bez nazwy",
        description: w.description || "",
        updatedAt: w.updatedAt || Date.now(),
        createdAt: w.createdAt || Date.now(),
      }));
      
      console.log(`Zmapowano ${mappedWorkspaces.length} workspace'ów w CloudTab`);
      setCloudWorkspaces(mappedWorkspaces);

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

    const selectedWorkspace = cloudWorkspaces.find(
      (w) => w.id === selectedWorkspaceId
    );
    if (!selectedWorkspace) {
      setCloudError("Nie można znaleźć wybranego workspace'a");
      return;
    }

    // Sprawdź, czy workspace o takim ID już istnieje lokalnie
    const existingWorkspace = workspaces.find(
      (w) => w.id === selectedWorkspaceId
    );

    const confirmMessage = existingWorkspace
      ? `Workspace "${selectedWorkspace.title}" już istnieje lokalnie. Wczytanie zastąpi lokalną wersję. Kontynuować?`
      : `Ta operacja wczyta workspace "${selectedWorkspace.title}" z Firebase. Kontynuować?`;

    showConfirmation("Wczytaj z Firebase", confirmMessage, async () => {
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
        
        // Dodatkowe sprawdzenie, czy workspace zawiera children
        if (!workspace.children) {
          console.warn("[DEBUG] Wczytany workspace nie ma tablicy children, inicjalizuję jako pustą tablicę");
          workspace.children = [];
        }
        
        console.log(`[DEBUG] Wczytano workspace z ${workspace.children.length} scenariuszami`);

        if (existingWorkspace) {
          // Jeżeli workspace o tym ID już istnieje, zastąp go
          console.log(`[DEBUG] Zastępowanie istniejącego workspace'a (id: ${existingWorkspace.id})`);
          onWorkspaceReplaced(workspace, existingWorkspace.id);
          setCloudSuccess(
            `Workspace '${workspace.title}' został zaktualizowany lokalnie z ${workspace.children.length} scenariuszami`
          );
        } else {
          // Jeżeli workspace o tym ID nie istnieje, dodaj go jako nowy
          console.log(`[DEBUG] Dodawanie nowego workspace'a (id: ${workspace.id})`);
          onWorkspaceAdded(workspace);
          setCloudSuccess(`Pomyślnie wczytano workspace '${workspace.title}' z ${workspace.children.length} scenariuszami`);
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
    });
  };

  // Format date
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <>
      {!currentUser ? (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wymagane uwierzytelnienie</AlertTitle>
          <AlertDescription>
            Musisz się zalogować, aby korzystać z funkcji kopii zapasowej i
            przywracania Firebase.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {/* Vertical radio options */}

          <RadioGroup
            value={cloudAction}
            onValueChange={(value) => setCloudAction(value as "save" | "load")}
            className="flex items-center gap-2  "
          >
            <div className="border border-border rounded-md flex p-6 gap-4">
              <RadioGroupItem value="save" id="cloud-save" />

              <Label
                htmlFor="cloud-save"
                className="font-medium flex items-center"
              >
                <CloudUpload className="h-4 w-4 mr-2 text-primary" />
                Zapisz do Firebase
              </Label>
            </div>
            <div className="border border-border rounded-md flex p-6 gap-4">
              <RadioGroupItem value="load" id="cloud-load" />

              <Label
                htmlFor="cloud-load"
                className="font-medium flex items-center"
              >
                <CloudDownload className="h-4 w-4 mr-2 text-primary" />
                Wczytaj z Firebase
              </Label>
            </div>
          </RadioGroup>

          {/* Content based on selected action */}
          {cloudAction === "save" ? (
            <CardContent className="pt-6">
              {currentWorkspace ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
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
                        Ten workspace już istnieje w chmurze i zostanie
                        nadpisany
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleSaveToFirebase}
                    disabled={isLoading}
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
                        Zapisz do Firebase
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Nie wybrano żadnego workspace'a</p>
                  <p className="text-sm mt-1">
                    Wybierz workspace, aby zapisać go w chmurze
                  </p>
                </div>
              )}
            </CardContent>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium">Workspace'y w chmurze</h3>
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
                  Odśwież
                </Button>
              </div>

              {isLoading && cloudWorkspaces.length === 0 ? (
                <div className="flex justify-center py-6">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : cloudWorkspaces.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border border-dashed rounded-md p-4">
                  <p>Nie znaleziono workspace'ów w Firebase</p>
                  <p className="text-sm mt-1">
                    Zapisz jakiś workspace, aby móc go później wczytać
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2 rounded-md bg-background max-h-60 overflow-y-auto">
                    {cloudWorkspaces.map((workspace) => (
                      <div
                        key={workspace.id}
                        onClick={() => setSelectedWorkspaceId(workspace.id)}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedWorkspaceId === workspace.id
                            ? " border border-primary/20"
                            : "hover:bg-muted border border-transparent"
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
                          <div className="flex-1 min-w-0 grid grid-cols-2">
                            <p className="font-medium">
                              {workspace.title || "Workspace bez nazwy"}
                            </p>

                            {workspace.description && (
                              <p className="text-right text-sm text-muted-foreground truncate mt-1">
                                {workspace.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(workspace.updatedAt)}
                              </div>

                              {workspaces.some(
                                (w) => w.id === workspace.id
                              ) && (
                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-100 px-2 py-0.5 rounded">
                                  Istnieje lokalnie
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleLoadSelectedWorkspace}
                    disabled={isLoading || !selectedWorkspaceId}
                    className="w-full"
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
          )}

          {/* Notifications */}
          {cloudError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Błąd</AlertTitle>
              <AlertDescription>{cloudError}</AlertDescription>
            </Alert>
          )}

          {cloudSuccess && (
            <Alert className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-100">
              <AlertTitle>Sukces</AlertTitle>
              <AlertDescription>{cloudSuccess}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </>
  );
};
