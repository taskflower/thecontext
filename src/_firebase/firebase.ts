// src/_firebase/firebase.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  DocumentData,
  CollectionReference,
  Query,
  WhereFilterOp,
} from "firebase/firestore";

import { db } from "./config";

// Definicja typów dla warunków where
interface WhereCondition {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

/**
 * Pomocnicza funkcja do pobierania dokumentów z kolekcji
 */
async function getDocumentsFromCollection(
  collectionName: string,
  whereConditions: WhereCondition[] = []
): Promise<DocumentData[]> {
  try {
    const collectionRef: CollectionReference<DocumentData> = collection(
      db,
      collectionName
    );

    let queryRef: Query<DocumentData> = collectionRef;
    if (whereConditions.length > 0) {
      queryRef = query(
        collectionRef,
        ...whereConditions.map((cond) =>
          where(cond.field, cond.operator, cond.value)
        )
      );
    }

    const snapshot = await getDocs(queryRef);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Pomocnicza funkcja do pobierania dokumentu po ID
 */
async function getDocumentById(
  collectionName: string,
  documentId: string
): Promise<DocumentData | null> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: documentId,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error(`Error fetching ${collectionName} document:`, error);
    throw error;
  }
}

/**
 * Serwis do obsługi danych z Firebase
 */
export class FirebaseService {
  /**
   * Pobiera wszystkie dostępne aplikacje
   */
  async getApplications(): Promise<any[]> {
    try {
      const applications = await getDocumentsFromCollection("applications");
      return applications.map((app) => ({
        id: app.id,
        name: app.name,
        description: app.description,
        templateSettings: app.templateSettings,
      }));
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  }

  /**
   * Pobiera szczegóły aplikacji wraz z jej workspaces
   */
  async getApplicationById(applicationId: string): Promise<any | null> {
    try {
      // Pobierz aplikację
      const application = await getDocumentById("applications", applicationId);
      if (!application) {
        console.log("Application not found");
        return null;
      }

      // Pobierz workspaces dla tej aplikacji
      const workspaces = await getDocumentsFromCollection("workspaces", [
        { field: "applicationId", operator: "==", value: applicationId },
      ]);

      // Dla każdego workspace pobierz scenariusze
      const workspacesWithScenarios = await Promise.all(
        workspaces.map(async (workspace: any) => {
          const scenarios = await getDocumentsFromCollection("scenarios", [
            { field: "workspaceId", operator: "==", value: workspace.id },
          ]);

          // Dla każdego scenariusza pobierz węzły (nodes)
          const scenariosWithNodes = await Promise.all(
            scenarios.map(async (scenario: any) => {
              const nodes = await getDocumentsFromCollection("nodes", [
                { field: "scenarioId", operator: "==", value: scenario.id },
              ]);

              // Sortuj węzły według pola order, jeśli istnieje
              const sortedNodes = nodes.sort((a: any, b: any) => {
                if (a.order !== undefined && b.order !== undefined) {
                  return a.order - b.order;
                }
                if (a.order !== undefined) return -1;
                if (b.order !== undefined) return 1;
                return 0;
              });

              return {
                ...scenario,
                nodes: sortedNodes,
              };
            })
          );

          return {
            ...workspace,
            scenarios: scenariosWithNodes,
          };
        })
      );

      return {
        ...application,
        workspaces: workspacesWithScenarios,
      };
    } catch (error) {
      console.error("Error fetching application:", error);
      throw error;
    }
  }

  /**
   * Pobiera wszystkie workspaces
   */
  async getWorkspaces(): Promise<any[]> {
    try {
      // Pobierz wszystkie workspaces
      const workspaces = await getDocumentsFromCollection("workspaces");

      // Dla każdego workspace pobierz scenariusze
      const workspacesWithScenarios = await Promise.all(
        workspaces.map(async (workspace: any) => {
          const scenarios = await getDocumentsFromCollection("scenarios", [
            { field: "workspaceId", operator: "==", value: workspace.id },
          ]);

          // Dla każdego scenariusza pobierz węzły (nodes)
          const scenariosWithNodes = await Promise.all(
            scenarios.map(async (scenario: any) => {
              const nodes = await getDocumentsFromCollection("nodes", [
                { field: "scenarioId", operator: "==", value: scenario.id },
              ]);

              // Sortuj węzły według pola order, jeśli istnieje
              const sortedNodes = nodes.sort((a: any, b: any) => {
                if (a.order !== undefined && b.order !== undefined) {
                  return a.order - b.order;
                }
                if (a.order !== undefined) return -1;
                if (b.order !== undefined) return 1;
                return 0;
              });

              return {
                ...scenario,
                nodes: sortedNodes,
              };
            })
          );

          return {
            ...workspace,
            scenarios: scenariosWithNodes,
          };
        })
      );

      return workspacesWithScenarios;
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      throw error;
    }
  }

  /**
   * Pobiera workspace po ID
   */
  async getWorkspaceById(workspaceId: string): Promise<any | null> {
    try {
      // Pobierz workspace
      const workspace = await getDocumentById("workspaces", workspaceId);
      if (!workspace) {
        console.log("Workspace not found");
        return null;
      }

      // Pobierz scenariusze dla tego workspace
      const scenarios = await getDocumentsFromCollection("scenarios", [
        { field: "workspaceId", operator: "==", value: workspaceId },
      ]);

      // Dla każdego scenariusza pobierz węzły (nodes)
      const scenariosWithNodes = await Promise.all(
        scenarios.map(async (scenario: any) => {
          const nodes = await getDocumentsFromCollection("nodes", [
            { field: "scenarioId", operator: "==", value: scenario.id },
          ]);

          // Sortuj węzły według pola order, jeśli istnieje
          const sortedNodes = nodes.sort((a: any, b: any) => {
            if (a.order !== undefined && b.order !== undefined) {
              return a.order - b.order;
            }
            if (a.order !== undefined) return -1;
            if (b.order !== undefined) return 1;
            return 0;
          });

          return {
            ...scenario,
            nodes: sortedNodes,
          };
        })
      );

      return {
        ...workspace,
        scenarios: scenariosWithNodes,
      };
    } catch (error) {
      console.error("Error fetching workspace:", error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
