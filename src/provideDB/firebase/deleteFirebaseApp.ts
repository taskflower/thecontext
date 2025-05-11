// src/provideDB/firebase/deleteFirebaseApp.ts
import { 
    doc, 
    deleteDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    writeBatch,
    Firestore
  } from 'firebase/firestore';
import { db } from './config';

  
  /**
   * Funkcja usuwająca aplikację wraz ze wszystkimi powiązanymi danymi z Firebase
   * @param appId ID aplikacji do usunięcia
   * @returns Promise<{success: boolean, message: string}>
   */
  export const deleteFirebaseApp = async (appId: string): Promise<{success: boolean, message: string}> => {
    if (!appId) {
      return { success: false, message: "Brak identyfikatora aplikacji" };
    }
    
    try {
      // 1. Pobieramy i usuwamy wszystkie workspaces powiązane z aplikacją
      await deleteCollectionByAppId(db, 'app_workspaces', appId);
      
      // 2. Pobieramy i usuwamy wszystkie scenariusze powiązane z aplikacją
      await deleteCollectionByAppId(db, 'app_scenarios', appId);
      
      // 3. Pobieramy i usuwamy wszystkie węzły powiązane z aplikacją
      await deleteCollectionByAppId(db, 'app_nodes', appId);
      
      // 4. Na koniec usuwamy samą aplikację
      await deleteDoc(doc(db, 'app_applications', appId));
      
      return { 
        success: true, 
        message: `Aplikacja ${appId} oraz wszystkie powiązane dane zostały pomyślnie usunięte` 
      };
    } catch (error: any) {
      console.error('Błąd podczas usuwania aplikacji:', error);
      return { 
        success: false, 
        message: `Błąd podczas usuwania aplikacji: ${error.message || "Nieznany błąd"}` 
      };
    }
  };
  
  /**
   * Funkcja pomocnicza do usuwania wszystkich dokumentów z kolekcji, które są powiązane z daną aplikacją
   */
  const deleteCollectionByAppId = async (
    db: Firestore, 
    collectionName: string, 
    appId: string
  ): Promise<void> => {
    // Najpierw pobieramy wszystkie dokumenty powiązane z aplikacją
    const q = query(collection(db, collectionName), where('appId', '==', appId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return; // Nic do usunięcia
    }
    
    // Używamy batcha do wydajnego usuwania wielu dokumentów na raz
    const batch = writeBatch(db);
    snapshot.docs.forEach(docRef => {
      batch.delete(docRef.ref);
    });
    
    // Zatwierdzamy batch
    await batch.commit();
  };