// src/components/studio/AppManagementPanel.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Database, BookOpen, RefreshCw } from "lucide-react";
import { AddLanguageDbContext } from "@/components/frontApp";
import { useAppStore } from "@/modules/store";

/**
 * Panel zarządzania aplikacją do nauki języka
 * Zawiera przyciski do inicjalizacji danych i dodawania kontekstów
 */
const AppManagementPanel: React.FC = () => {
  const currentScenario = useAppStore(state => state.getCurrentScenario());
  
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium mb-2">Zarządzanie aplikacją do nauki języka</h3>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Narzędzia do konfiguracji i zarządzania aplikacją do nauki języka. 
          Wybierz scenariusz, a następnie użyj przycisków poniżej, aby zainicjalizować dane i dodać konteksty.
        </p>
        
        {!currentScenario && (
          <div className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 p-3 rounded-md text-sm">
            <strong>Uwaga:</strong> Musisz najpierw wybrać scenariusz, aby móc dodać konteksty.
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <div className="p-4 border rounded-md space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Inicjalizacja danych
          </h4>
          <p className="text-sm text-muted-foreground">
            Inicjalizuje bazę danych IndexedDB z lekcjami, ćwiczeniami i danymi użytkownika.
          </p>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={async () => {
              try {
                const { setupLanguageLearningData } = await import('@/modules/indexedDB/setupLanguageLearning');
                const result = await setupLanguageLearningData(true);
                
                if (result) {
                  alert('Dane do nauki języka zainicjalizowane pomyślnie!');
                } else {
                  alert('Nie udało się zainicjalizować danych.');
                }
              } catch (error) {
                console.error('Błąd podczas inicjalizacji danych:', error);
                alert('Błąd podczas inicjalizacji danych. Sprawdź konsolę.');
              }
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Inicjalizuj dane w bazie
          </Button>
        </div>
        
        <div className="p-4 border rounded-md space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Konteksty aplikacji
          </h4>
          <p className="text-sm text-muted-foreground">
            Dodaje wszystkie niezbędne konteksty do nauki języka: bazy danych, 
            zmienne lekcji i postępu użytkownika.
          </p>
          <div className="flex justify-center">
            <AddLanguageDbContext />
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 border rounded-md">
        <h4 className="font-medium mb-2">Instrukcja użycia</h4>
        <ol className="list-decimal ml-5 space-y-2 text-sm">
          <li>Wybierz scenariusz, w którym chcesz używać aplikacji do nauki języka</li>
          <li>Kliknij przycisk <strong>Inicjalizuj dane w bazie</strong>, aby utworzyć kolekcje IndexedDB</li>
          <li>Kliknij przycisk <strong>Dodaj konteksty języka</strong>, aby dodać wszystkie potrzebne konteksty</li>
          <li>Przejdź do trybu odtwarzania flow, aby rozpocząć naukę</li>
        </ol>
      </div>
    </div>
  );
};

export default AppManagementPanel;