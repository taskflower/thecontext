/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/database/databaseConfigurator.ts
import { ContextType } from "../context/types";
import { useAppStore } from "../store";

/**
 * Interfejs dla ogólnego schematu kolekcji
 * Pozwala na definiowanie dowolnych kolekcji w IndexedDB
 */
export interface CollectionSchema {
  name: string; // Nazwa kolekcji
  indexes?: {
    // Indeksy dla szybszego wyszukiwania
    name: string;
    keyPath: string;
    options?: IDBIndexParameters;
  }[];
  sampleData?: unknown; // Przykładowa struktura danych (do walidacji)
}

/**
 * Interfejs dla konfiguracji integracji z bazą danych
 */
export interface DatabaseConfig {
  dbName: string; // Nazwa bazy danych
  version: number; // Wersja (ważna dla migracji)
  collections: CollectionSchema[]; // Kolekcje w bazie
  contextKey: string; // Klucz kontekstu do przechowywania referencji
}

/**
 * Funkcja inicjalizująca bazę danych na podstawie konfiguracji
 */
export const initDatabase = async (
  config: DatabaseConfig
): Promise<boolean> => {
  try {
    // 1. Sprawdź czy kontekst już istnieje
    const store = useAppStore.getState();
    const contextItems = store.getContextItems();
    const dbContext = contextItems.find(
      (item) => item.title === config.contextKey
    );

    // 2. Jeśli kontekst nie istnieje, utwórz go
    if (!dbContext) {
      store.addContextItem({
        title: config.contextKey,
        type: ContextType.INDEXED_DB,
        content: config.dbName,
        metadata: {
          collection: config.dbName,
          schema: {
            version: config.version,
            collections: config.collections.map((c) => c.name),
          },
        },
        persistent: true,
      });

      console.log(`Initialized database context: ${config.contextKey}`);
    }

    // 3. Otwórz połączenie z bazą danych
    const openRequest = indexedDB.open(config.dbName, config.version);

    // 4. Obsłuż aktualizację/utworzenie struktury
    openRequest.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Utwórz kolekcje (object stores)
      for (const collection of config.collections) {
        // Sprawdź czy kolekcja już istnieje
        if (!db.objectStoreNames.contains(collection.name)) {
          // Utwórz kolekcję
          const objectStore = db.createObjectStore(collection.name, {
            keyPath: "id",
            autoIncrement: false,
          });

          // Dodaj indeksy
          if (collection.indexes) {
            for (const index of collection.indexes) {
              objectStore.createIndex(index.name, index.keyPath, index.options);
            }
          }

          console.log(`Created collection: ${collection.name}`);
        }
      }
    };

    // 5. Obsłuż błędy
    openRequest.onerror = (event) => {
      console.error(
        "Database error:",
        (event.target as IDBOpenDBRequest).error
      );
      return false;
    };

    // 6. Poczekaj na otwarcie i zwróć wynik
    return new Promise((resolve, reject) => {
      openRequest.onsuccess = () => {
        const db = openRequest.result;
        console.log(
          `Successfully opened database: ${config.dbName}, version: ${db.version}`
        );
        db.close();
        resolve(true);
      };

      openRequest.onerror = () => {
        reject(new Error("Failed to open database"));
      };
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};

/**
 * Funkcja do dodawania danych do kolekcji
 */
export const addItemsToCollection = async <T extends { id: string }>(
  dbName: string,
  collectionName: string,
  items: T[]
): Promise<boolean> => {
  try {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(dbName);

      openRequest.onerror = () => {
        reject(new Error(`Could not open database: ${dbName}`));
      };

      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const transaction = db.transaction(collectionName, "readwrite");
        const objectStore = transaction.objectStore(collectionName);

        // Add each item to the collection
        let successCount = 0;

        for (const item of items) {
          const request = objectStore.put(item);

          request.onsuccess = () => {
            successCount++;
            if (successCount === items.length) {
              console.log(`Added ${successCount} items to ${collectionName}`);
              db.close();
              resolve(true);
            }
          };

          request.onerror = () => {
            console.error(
              `Error adding item to ${collectionName}:`,
              request.error
            );
            db.close();
            reject(new Error(`Error adding item: ${request.error}`));
          };
        }

        // Handle empty items array
        if (items.length === 0) {
          db.close();
          resolve(true);
        }
      };
    });
  } catch (error) {
    console.error("Error adding items:", error);
    return false;
  }
};

/**
 * Funkcja do pobierania wszystkich elementów z kolekcji
 */
export const getAllItems = async <T>(
  dbName: string,
  collectionName: string
): Promise<T[]> => {
  try {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(dbName);

      openRequest.onerror = () => {
        reject(new Error(`Could not open database: ${dbName}`));
      };

      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const transaction = db.transaction(collectionName, "readonly");
        const objectStore = transaction.objectStore(collectionName);
        const request = objectStore.getAll();

        request.onsuccess = () => {
          db.close();
          resolve(request.result as T[]);
        };

        request.onerror = () => {
          db.close();
          reject(new Error(`Error getting items: ${request.error}`));
        };
      };
    });
  } catch (error) {
    console.error("Error getting items:", error);
    return [];
  }
};

/**
 * Funkcja do pobierania elementów z kolekcji na podstawie indeksu
 */
export const getItemsByIndex = async <T>(
  dbName: string,
  collectionName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> => {
  try {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(dbName);

      openRequest.onerror = () => {
        reject(new Error(`Could not open database: ${dbName}`));
      };

      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const transaction = db.transaction(collectionName, "readonly");
        const objectStore = transaction.objectStore(collectionName);
        const index = objectStore.index(indexName);
        const request = index.getAll(value);

        request.onsuccess = () => {
          db.close();
          resolve(request.result as T[]);
        };

        request.onerror = () => {
          db.close();
          reject(new Error(`Error getting items by index: ${request.error}`));
        };
      };
    });
  } catch (error) {
    console.error("Error getting items by index:", error);
    return [];
  }
};

/**
 * Funkcja do usuwania elementów z kolekcji
 */
export const deleteItems = async (
  dbName: string,
  collectionName: string,
  ids: string[]
): Promise<boolean> => {
  try {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(dbName);

      openRequest.onerror = () => {
        reject(new Error(`Could not open database: ${dbName}`));
      };

      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const transaction = db.transaction(collectionName, "readwrite");
        const objectStore = transaction.objectStore(collectionName);

        let successCount = 0;

        for (const id of ids) {
          const request = objectStore.delete(id);

          request.onsuccess = () => {
            successCount++;
            if (successCount === ids.length) {
              console.log(
                `Deleted ${successCount} items from ${collectionName}`
              );
              db.close();
              resolve(true);
            }
          };

          request.onerror = () => {
            console.error(
              `Error deleting item from ${collectionName}:`,
              request.error
            );
            db.close();
            reject(new Error(`Error deleting item: ${request.error}`));
          };
        }

        // Handle empty ids array
        if (ids.length === 0) {
          db.close();
          resolve(true);
        }
      };
    });
  } catch (error) {
    console.error("Error deleting items:", error);
    return false;
  }
};

/**
 * Funkcja do generowania węzłów na podstawie danych
 *
 * Ta funkcja może być rozszerzona dla różnych przypadków użycia,
 * na przykład generowania flow dla lekcji, ankiet, procesów biznesowych, itd.
 */
export const generateNodesFromData = (
  data: any,
  template: {
    nodePrefix: string;
    generateAssistantMessage: (item: any, index: number) => string;
    spacing: { x: number; y: number };
    startPosition: { x: number; y: number };
    pluginMapping?: (item: any) => string | null;
    contextKey?: string;
  }
) => {
  const store = useAppStore.getState();

  // Wygeneruj węzły na podstawie dostarczonego szablonu
  let lastNodeId = `${template.nodePrefix}-start`;
  let currentX = template.startPosition.x;
  let currentY = template.startPosition.y;

  // Utwórz węzeł początkowy
  store.addNode({
    label: `Start`,
    assistantMessage: `Witaj! Rozpoczynamy nową sekwencję.`,
    userPrompt: "",
    position: { x: currentX, y: currentY },
  });

  // Przygotuj tablice dla IDs węzłów w prawidłowej kolejności
  const nodeIds = [lastNodeId];

  // Generuj węzły dla każdego elementu
  data.forEach((item: any, index: number) => {
    currentX += template.spacing.x;

    // Dodaj niewielką losową wariację pozycji y dla lepszego wyglądu
    currentY += (Math.random() - 0.5) * template.spacing.y;

    const nodeId = `${template.nodePrefix}-item-${index}`;

    // Utwórz węzeł
    store.addNode({
      label: `Krok ${index + 1}`,
      assistantMessage: template.generateAssistantMessage(item, index),
      userPrompt: "",
      position: { x: currentX, y: currentY },
      pluginKey: template.pluginMapping
        ? template.pluginMapping(item) || undefined
        : undefined,
      contextKey: template.contextKey,
    });

    // Utwórz krawędź
    store.addEdge({
      source: lastNodeId,
      target: nodeId,
      label: `Krok ${index + 1}`,
    });

    lastNodeId = nodeId;
    nodeIds.push(nodeId);
  });

  // Dodaj węzeł końcowy
  currentX += template.spacing.x;
  currentY = template.startPosition.y;

  const endNodeId = `${template.nodePrefix}-end`;
  store.addNode({
    label: `Zakończenie`,
    assistantMessage: `Gratulacje! Ukończyłeś wszystkie kroki.`,
    userPrompt: "",
    position: { x: currentX, y: currentY },
  });

  store.addEdge({
    source: lastNodeId,
    target: endNodeId,
    label: "Zakończ",
  });

  nodeIds.push(endNodeId);

  return {
    nodeIds,
    startNodeId: nodeIds[0],
    endNodeId: nodeIds[nodeIds.length - 1],
  };
};

/**
 * Funkcja pomocnicza do tworzenia konfiguracji bazy danych dla różnych typów danych
 *
 * Możemy dostarczyć gotowe szablony dla popularnych przypadków użycia
 */
export const createDatabaseConfig = (
  type: "lessons" | "surveys" | "processes" | "custom",
  options: any
): DatabaseConfig => {
  switch (type) {
    case "lessons":
      return {
        dbName: options.dbName || "language_learning",
        version: options.version || 1,
        contextKey: options.contextKey || "lessonsDatabase",
        collections: [
          {
            name: "lessons",
            indexes: [
              { name: "unitId", keyPath: "unitId" },
              { name: "difficulty", keyPath: "difficulty" },
              { name: "tags", keyPath: "tags", options: { multiEntry: true } },
            ],
          },
          {
            name: "userProgress",
            indexes: [{ name: "userId", keyPath: "userId" }],
          },
        ],
      };

    case "surveys":
      return {
        dbName: options.dbName || "surveys",
        version: options.version || 1,
        contextKey: options.contextKey || "surveysDatabase",
        collections: [
          {
            name: "surveys",
            indexes: [
              { name: "category", keyPath: "category" },
              { name: "active", keyPath: "active" },
            ],
          },
          {
            name: "responses",
            indexes: [
              { name: "surveyId", keyPath: "surveyId" },
              { name: "userId", keyPath: "userId" },
            ],
          },
        ],
      };

    case "processes":
      return {
        dbName: options.dbName || "business_processes",
        version: options.version || 1,
        contextKey: options.contextKey || "processesDatabase",
        collections: [
          {
            name: "processes",
            indexes: [
              { name: "category", keyPath: "category" },
              { name: "department", keyPath: "department" },
            ],
          },
          {
            name: "instances",
            indexes: [
              { name: "processId", keyPath: "processId" },
              { name: "status", keyPath: "status" },
            ],
          },
        ],
      };

    case "custom":
      // Dla niestandardowych konfiguracji, używamy opcji dostarczone przez użytkownika
      return {
        dbName: options.dbName || "custom_db",
        version: options.version || 1,
        contextKey: options.contextKey || "customDatabase",
        collections: options.collections || [],
      };

    default:
      throw new Error(`Unknown database type: ${type}`);
  }
};
