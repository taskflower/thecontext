// src/_firebase/seedFirestore.ts
import { importService } from '@/_firebase/services';

/**
 * Funkcja do importu danych z pliku JSON
 * @param userId ID zalogowanego użytkownika
 * @param jsonData Dane aplikacji w formacie JSON
 * @returns Obiekt z ID utworzonych zasobów
 */
export async function seedFirestoreFromData(userId: string, jsonData: any[]) {
  try {
    // Wykorzystujemy nasz serwis importu
    const createdIds = await importService.seedFirestoreFromData(userId, jsonData);
    return createdIds;
  } catch (error) {
    console.error("Błąd podczas importu danych:", error);
    throw error;
  }
}