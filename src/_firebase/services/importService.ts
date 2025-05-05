// src/_firebase/services/importService.ts
import { Application, Workspace, Scenario, NodeData } from '@/types';
import { applicationService, workspaceService, scenarioService, nodeService } from './';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/_firebase/config';

export interface CreatedIds {
  applicationId: string;
  workspaceId: string;
  scenarioId: string;
}

export const importService = {
  /**
   * Importuje dane z JSONa do Firestore
   */
  seedFirestoreFromData: async (userId: string, jsonData: any[]): Promise<CreatedIds> => {
    let firstApplicationId = "";
    let firstWorkspaceId = "";
    let firstScenarioId = "";

    try {
      // Dla każdej aplikacji z danych JSON
      for (const appItem of jsonData) {
        const applicationData: Partial<Application> = {
          name: appItem.name,
          description: appItem.description || "",
          tplDir: appItem.tplDir || "default",
          createdBy: userId,
        };

        // Dodaj aplikację
        const applicationId = await applicationService.add(applicationData);

        // Zapisz ID pierwszej aplikacji
        if (!firstApplicationId) {
          firstApplicationId = applicationId;
        }

        // Dla każdego workspace w aplikacji
        if (Array.isArray(appItem.workspaces)) {
          for (const workspaceItem of appItem.workspaces) {
            // Przekształć stare templateSettings jeśli istnieją
            let templateSettings = workspaceItem.templateSettings || {};
            if (templateSettings.template && !templateSettings.tplDir) {
              templateSettings.tplDir = templateSettings.template;
              delete templateSettings.template;
            }
            if (templateSettings.layout && !templateSettings.layoutFile) {
              templateSettings.layoutFile = templateSettings.layout;
              delete templateSettings.layout;
            }

            const workspaceData: Partial<Workspace> = {
              name: workspaceItem.name,
              description: workspaceItem.description || "",
              applicationId,
              userId,
              icon: workspaceItem.icon || "folder",
              initialContext: workspaceItem.initialContext || {},
              templateSettings,
            };

            // Dodaj workspace
            const workspaceId = await workspaceService.add(workspaceData);

            // Zapisz ID pierwszego workspace'a
            if (!firstWorkspaceId) {
              firstWorkspaceId = workspaceId;
            }

            // Dla każdego scenariusza w workspace
            if (Array.isArray(workspaceItem.scenarios)) {
              for (const scenarioItem of workspaceItem.scenarios) {
                const scenarioData: Partial<Scenario> = {
                  name: scenarioItem.name,
                  description: scenarioItem.description || "",
                  icon: scenarioItem.icon || "file",
                  systemMessage: scenarioItem.systemMessage || "",
                  workspaceId,
                  dependsOn: scenarioItem.dependsOn || [],
                };

                // Dodaj scenariusz
                const scenarioId = await scenarioService.add(scenarioData);

                // Zapisz ID pierwszego scenariusza
                if (!firstScenarioId) {
                  firstScenarioId = scenarioId;
                }

                // Dla każdego węzła w scenariuszu
                if (Array.isArray(scenarioItem.nodes)) {
                  // Dodajemy węzły z uwzględnieniem pola order
                  const sortedNodes = [...scenarioItem.nodes].sort((a, b) => {
                    if (a.order !== undefined && b.order !== undefined) {
                      return a.order - b.order;
                    }
                    return 0;
                  });

                  for (let i = 0; i < sortedNodes.length; i++) {
                    const nodeItem = sortedNodes[i];

                    // Jeśli pole order nie jest zdefiniowane, ustaw je na indeks w tablicy
                    const nodeOrder = nodeItem.order !== undefined ? nodeItem.order : i;

                    // Obsługa migracji z template na tplFile
                    let tplFile = nodeItem.tplFile || nodeItem.template || "default";

                    const nodeData: Partial<NodeData> = {
                      id: nodeItem.id,
                      label: nodeItem.label || "",
                      scenarioId,
                      contextPath: nodeItem.contextPath || "",
                      tplFile: tplFile,
                      assistantMessage: nodeItem.assistantMessage || "",
                      attrs: nodeItem.attrs || {},
                      order: nodeOrder,
                    };

                    // Dodaj węzeł
                    await nodeService.add(nodeData);
                  }
                }
              }
            } else {
              console.error(
                `Workspace "${workspaceItem.name}" nie zawiera scenariuszy lub ma nieprawidłowy format`
              );
            }
          }
        } else {
          console.error(
            `Aplikacja "${appItem.name}" nie zawiera workspaces lub ma nieprawidłowy format`
          );
        }
      }

      // Weryfikacja importu
      await verifyDataWasAdded({
        applicationId: firstApplicationId,
        workspaceId: firstWorkspaceId,
        scenarioId: firstScenarioId,
      });

      return {
        applicationId: firstApplicationId,
        workspaceId: firstWorkspaceId,
        scenarioId: firstScenarioId,
      };
    } catch (error) {
      console.error("Błąd podczas importu danych:", error);
      throw error;
    }
  }
};

// Pomocnicza funkcja weryfikacji importu
async function verifyDataWasAdded(ids: CreatedIds) {
  try {
    // Sprawdź aplikację
    if (ids.applicationId) {
      const appDoc = doc(db, "applications", ids.applicationId);
      console.log("Ścieżka dokumentu aplikacji:", appDoc.path);
    }

    // Sprawdź workspace
    if (ids.workspaceId) {
      const workspaceDoc = doc(db, "workspaces", ids.workspaceId);
      console.log("Ścieżka dokumentu workspace:", workspaceDoc.path);
    }

    // Sprawdź scenariusz
    if (ids.scenarioId) {
      const scenarioDoc = doc(db, "scenarios", ids.scenarioId);
      console.log("Ścieżka dokumentu scenariusza:", scenarioDoc.path);
    }

    // Sprawdź, czy możemy pobrać workspaces
    const workspacesSnap = await getDocs(collection(db, "workspaces"));

    if (workspacesSnap.empty) {
      console.warn("⚠️ Kolekcja workspaces jest pusta po dodaniu danych!");
    } else {
      console.log(`✓ Znaleziono ${workspacesSnap.size} workspaces w bazie`);

      // Wypisz ID dodanych workspace'ów
      workspacesSnap.forEach((doc) => {
        console.log(`- Workspace ID: ${doc.id}, Nazwa: ${doc.data().name}`);
      });
    }
  } catch (error) {
    console.error("Błąd podczas weryfikacji danych:", error);
  }
}