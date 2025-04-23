// src/_firebase/seedFirestore.ts
import { 
  collection, 
  doc, 
  addDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/_firebase/config';
import { mockApplications } from '@/mocks/firebase-mock';

/**
 * Skrypt dodający dane z mocków do Firestore
 * Funkcja usuwa istniejące dane i ładuje je od nowa z mocków
 */
export async function seedFirestore(userId: string) {
  console.log('Rozpoczęcie dodawania danych z mocków do Firestore...');
  
  try {
    // 1. Sprawdź czy dane już istnieją i usuń je
    await clearExistingData();
    
    // 2. Dodaj aplikacje z mocków
    const createdIds = await addMockDataToFirestore(userId);
    
    console.log('Proces dodawania danych testowych zakończony powodzeniem!');
    console.log('Utworzone ID:', createdIds);
    
    // Sprawdź, czy możemy bezpośrednio pobrać i wyświetlić dane
    await verifyDataWasAdded(createdIds);
    
    return createdIds;
    
  } catch (error) {
    console.error('Błąd podczas dodawania danych testowych:', error);
    throw error;
  }
}

/**
 * Funkcja do importu danych z pliku JSON
 * @param userId ID zalogowanego użytkownika
 * @param jsonData Dane aplikacji w formacie JSON
 */
export async function seedFirestoreFromData(userId: string, jsonData: any[]) {
  console.log('Rozpoczęcie importu danych z pliku JSON do Firestore...');
  
  try {
    // 1. Sprawdź czy dane już istnieją i usuń je
    await clearExistingData();
    
    // 2. Dodaj aplikacje z danych JSON
    const createdIds = await addDataToFirestore(userId, jsonData);
    
    console.log('Proces importu danych zakończony powodzeniem!');
    console.log('Utworzone ID:', createdIds);
    
    // Sprawdź, czy możemy bezpośrednio pobrać i wyświetlić dane
    await verifyDataWasAdded(createdIds);
    
    return createdIds;
    
  } catch (error) {
    console.error('Błąd podczas importu danych:', error);
    throw error;
  }
}

/**
 * Usuwa wszystkie istniejące dane z kolekcji związanych z aplikacją
 */
async function clearExistingData() {
  const collections = ['applications', 'workspaces', 'scenarios', 'nodes'];
  
  for (const collectionName of collections) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    if (!snapshot.empty) {
      console.log(`Usuwanie istniejących danych z kolekcji ${collectionName}...`);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`Usunięto ${snapshot.size} dokumentów z kolekcji ${collectionName}`);
    }
  }
}

/**
 * Dodaje dane z mocków do Firestore
 */
async function addMockDataToFirestore(userId: string) {
  return addDataToFirestore(userId, mockApplications);
}

/**
 * Dodaje dane z JSON do Firestore
 * @param userId ID zalogowanego użytkownika
 * @param appData Dane aplikacji do dodania
 */
async function addDataToFirestore(userId: string, appData: any[]) {
  const applicationsRef = collection(db, 'applications');
  const workspacesRef = collection(db, 'workspaces');
  const scenariosRef = collection(db, 'scenarios');
  const nodesRef = collection(db, 'nodes');
  
  // Przechowuje ID pierwszej aplikacji, workspace'a i scenariusza do zwrócenia
  let firstApplicationId = '';
  let firstWorkspaceId = '';
  let firstScenarioId = '';
  
  // Dla każdej aplikacji z mocków lub danych JSON
  for (const mockApp of appData) {
    console.log(`Dodawanie aplikacji: "${mockApp.name}"...`);
    
    const applicationData = {
      name: mockApp.name,
      description: mockApp.description || '',
      createdAt: new Date(),
      createdBy: userId
    };
    
    // Dodaj aplikację
    const applicationDoc = await addDoc(applicationsRef, applicationData);
    const applicationId = applicationDoc.id;
    console.log(`Dodano aplikację "${mockApp.name}" z ID: ${applicationId}`);
    
    // Zapisz ID pierwszej aplikacji
    if (!firstApplicationId) {
      firstApplicationId = applicationId;
    }
    
    // Dla każdego workspace w aplikacji
    if (Array.isArray(mockApp.workspaces)) {
      for (const mockWorkspace of mockApp.workspaces) {
        console.log(`Dodawanie workspace: "${mockWorkspace.name}"...`);
        
        const workspaceData = {
          name: mockWorkspace.name,
          description: mockWorkspace.description || '',
          applicationId,
          userId,
          icon: mockWorkspace.icon || 'folder',
          initialContext: mockWorkspace.initialContext || {},
          templateSettings: mockWorkspace.templateSettings || {},
          createdAt: new Date()
        };
        
        // Dodaj workspace
        const workspaceDoc = await addDoc(workspacesRef, workspaceData);
        const workspaceId = workspaceDoc.id;
        console.log(`Dodano workspace "${mockWorkspace.name}" z ID: ${workspaceId}`);
        
        // Zapisz ID pierwszego workspace'a
        if (!firstWorkspaceId) {
          firstWorkspaceId = workspaceId;
        }
        
        // Dla każdego scenariusza w workspace
        if (Array.isArray(mockWorkspace.scenarios)) {
          for (const mockScenario of mockWorkspace.scenarios) {
            console.log(`Dodawanie scenariusza: "${mockScenario.name}"...`);
            
            const scenarioData = {
              name: mockScenario.name,
              description: mockScenario.description || '',
              icon: mockScenario.icon || 'file',
              systemMessage: mockScenario.systemMessage || '',
              workspaceId,
              createdAt: new Date()
            };
            
            // Dodaj scenariusz
            const scenarioDoc = await addDoc(scenariosRef, scenarioData);
            const scenarioId = scenarioDoc.id;
            console.log(`Dodano scenariusz "${mockScenario.name}" z ID: ${scenarioId}`);
            
            // Zapisz ID pierwszego scenariusza
            if (!firstScenarioId) {
              firstScenarioId = scenarioId;
            }
            
            // Dla każdego węzła w scenariuszu
            if (Array.isArray(mockScenario.nodes)) {
              for (const mockNode of mockScenario.nodes) {
                const nodeData = {
                  id: mockNode.id,
                  label: mockNode.label || '',
                  scenarioId,
                  contextPath: mockNode.contextPath || '',
                  templateId: mockNode.templateId || 'default',
                  assistantMessage: mockNode.assistantMessage || '',
                  attrs: mockNode.attrs || {},
                  createdAt: new Date()
                };
                
                // Dodaj węzeł
                await addDoc(nodesRef, nodeData);
              }
              console.log(`Dodano ${mockScenario.nodes.length} węzłów do scenariusza "${mockScenario.name}"`);
            }
          }
        } else {
          console.log(`Workspace "${mockWorkspace.name}" nie zawiera scenariuszy lub ma nieprawidłowy format`);
        }
      }
    } else {
      console.log(`Aplikacja "${mockApp.name}" nie zawiera workspaces lub ma nieprawidłowy format`);
    }
  }
  
  return {
    applicationId: firstApplicationId,
    workspaceId: firstWorkspaceId,
    scenarioId: firstScenarioId
  };
}

/**
 * Weryfikuje, czy dane zostały faktycznie dodane do bazy
 */
async function verifyDataWasAdded(ids:any) {
  try {
    console.log('Weryfikacja dodanych danych...');
    
    // Sprawdź aplikację
    if (ids.applicationId) {
      const appDoc = await doc(db, 'applications', ids.applicationId);
      console.log('Ścieżka dokumentu aplikacji:', appDoc.path);
    }
    
    // Sprawdź workspace
    if (ids.workspaceId) {
      const workspaceDoc = await doc(db, 'workspaces', ids.workspaceId);
      console.log('Ścieżka dokumentu workspace:', workspaceDoc.path);
    }
    
    // Sprawdź scenariusz
    if (ids.scenarioId) {
      const scenarioDoc = await doc(db, 'scenarios', ids.scenarioId);
      console.log('Ścieżka dokumentu scenariusza:', scenarioDoc.path);
    }
    
    // Sprawdź, czy możemy pobrać workspaces
    const workspacesRef = collection(db, 'workspaces');
    const workspacesSnap = await getDocs(workspacesRef);
    
    if (workspacesSnap.empty) {
      console.warn('⚠️ Kolekcja workspaces jest pusta po dodaniu danych!');
    } else {
      console.log(`✓ Znaleziono ${workspacesSnap.size} workspaces w bazie`);
      
      // Wypisz ID dodanych workspace'ów
      workspacesSnap.forEach(doc => {
        console.log(`- Workspace ID: ${doc.id}, Nazwa: ${doc.data().name}`);
      });
    }
    
  } catch (error) {
    console.error('Błąd podczas weryfikacji danych:', error);
  }
}