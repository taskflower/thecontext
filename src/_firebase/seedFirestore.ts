// src/_firebase/seedFirestore.ts
import { collection, doc, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/_firebase/config";

/**
 * Funkcja do importu danych z pliku JSON
 * @param userId ID zalogowanego użytkownika
 * @param jsonData Dane aplikacji w formacie JSON
 */
export async function seedFirestoreFromData(userId: string, jsonData: any[]) {
  try {
    // Dodaj aplikacje z danych JSON
    const createdIds = await addDataToFirestore(userId, jsonData);

    // Sprawdź, czy możemy bezpośrednio pobrać i wyświetlić dane
    await verifyDataWasAdded(createdIds);

    return createdIds;
  } catch (error) {
    console.error("Błąd podczas importu danych:", error);
    throw error;
  }
}

/**
 * Dodaje dane z JSON do Firestore
 * @param userId ID zalogowanego użytkownika
 * @param appData Dane aplikacji do dodania
 */
async function addDataToFirestore(userId: string, appData: any[]) {
  const applicationsRef = collection(db, "applications");
  const workspacesRef = collection(db, "workspaces");
  const scenariosRef = collection(db, "scenarios");
  const nodesRef = collection(db, "nodes");

  // Przechowuje ID pierwszej aplikacji, workspace'a i scenariusza do zwrócenia
  let firstApplicationId = "";
  let firstWorkspaceId = "";
  let firstScenarioId = "";

  // Dla każdej aplikacji z danych JSON
  for (const appItem of appData) {
    const applicationData = {
      name: appItem.name,
      description: appItem.description || "",
      createdAt: new Date(),
      createdBy: userId,
    };

    // Dodaj aplikację
    const applicationDoc = await addDoc(applicationsRef, applicationData);
    const applicationId = applicationDoc.id;

    // Zapisz ID pierwszej aplikacji
    if (!firstApplicationId) {
      firstApplicationId = applicationId;
    }

    // Dla każdego workspace w aplikacji
    if (Array.isArray(appItem.workspaces)) {
      for (const workspaceItem of appItem.workspaces) {
        const workspaceData = {
          name: workspaceItem.name,
          description: workspaceItem.description || "",
          applicationId,
          userId,
          icon: workspaceItem.icon || "folder",
          initialContext: workspaceItem.initialContext || {},
          templateSettings: workspaceItem.templateSettings || {},
          createdAt: new Date(),
        };

        // Dodaj workspace
        const workspaceDoc = await addDoc(workspacesRef, workspaceData);
        const workspaceId = workspaceDoc.id;

        // Zapisz ID pierwszego workspace'a
        if (!firstWorkspaceId) {
          firstWorkspaceId = workspaceId;
        }

        // Dla każdego scenariusza w workspace
        if (Array.isArray(workspaceItem.scenarios)) {
          for (const scenarioItem of workspaceItem.scenarios) {
            const scenarioData = {
              name: scenarioItem.name,
              description: scenarioItem.description || "",
              icon: scenarioItem.icon || "file",
              systemMessage: scenarioItem.systemMessage || "",
              workspaceId,
              createdAt: new Date(),
            };

            // Dodaj scenariusz
            const scenarioDoc = await addDoc(scenariosRef, scenarioData);
            const scenarioId = scenarioDoc.id;

            // Zapisz ID pierwszego scenariusza
            if (!firstScenarioId) {
              firstScenarioId = scenarioId;
            }

            // Dla każdego węzła w scenariuszu
            if (Array.isArray(scenarioItem.nodes)) {
              // Dodajemy węzły z uwzględnieniem pola order (sortujemy przed dodaniem, aby zapewnić poprawną kolejność)
              const sortedNodes = [...scenarioItem.nodes].sort((a, b) => {
                // Jeśli pole order istnieje, sortuj według niego
                if (a.order !== undefined && b.order !== undefined) {
                  return a.order - b.order;
                }
                // W przeciwnym razie zachowaj oryginalną kolejność
                return 0;
              });

              for (let i = 0; i < sortedNodes.length; i++) {
                const nodeItem = sortedNodes[i];

                // Jeśli pole order nie jest zdefiniowane, ustaw je na indeks w tablicy
                const nodeOrder =
                  nodeItem.order !== undefined ? nodeItem.order : i;

                const nodeData = {
                  id: nodeItem.id,
                  label: nodeItem.label || "",
                  scenarioId,
                  contextPath: nodeItem.contextPath || "",
                  templateId: nodeItem.templateId || "default",
                  assistantMessage: nodeItem.assistantMessage || "",
                  attrs: nodeItem.attrs || {},
                  order: nodeOrder, // Dodajemy pole order do węzła w bazie danych
                  createdAt: new Date(),
                };

                // Dodaj węzeł
                await addDoc(nodesRef, nodeData);
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

  return {
    applicationId: firstApplicationId,
    workspaceId: firstWorkspaceId,
    scenarioId: firstScenarioId,
  };
}

/**
 * Weryfikuje, czy dane zostały faktycznie dodane do bazy
 */
async function verifyDataWasAdded(ids: any) {
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
    const workspacesRef = collection(db, "workspaces");
    const workspacesSnap = await getDocs(workspacesRef);

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
