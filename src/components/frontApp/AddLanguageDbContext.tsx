// src/components/frontApp/AddLanguageDbContext.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { useAppStore } from "@/modules/store";
import { ContextType } from "@/modules/context/types";

/**
 * Przycisk do dodawania kontekstu bazy danych dla nauki języka
 * Ten prosty komponent nie używa żadnych hooka useEffect, 
 * aby uniknąć pętli nieskończonych
 */
const AddLanguageDbContext: React.FC = () => {
  const handleClick = () => {
    // Pobieramy dane ze store bezpośrednio w momencie kliknięcia
    const state = useAppStore.getState();
    const addContextItem = state.addContextItem;
    const deleteContextItem = state.deleteContextItem;
    const getContextItems = state.getContextItems;
    const getCurrentWorkspace = state.getCurrentWorkspace;
    const currentScenarioId = state.selected.scenario;
    
    if (!currentScenarioId) {
      alert('Musisz najpierw wybrać scenariusz!');
      return;
    }
    
    try {
      // Pobierz WSZYSTKIE konteksty (nie tylko te związane z IndexedDB)
      const allContexts = getContextItems();
      console.log('Wszystkie konteksty przed czyszczeniem:', allContexts);
      
      // Znajdź WSZYSTKIE zduplikowane elementy, które chcemy usunąć
      const titlesToClean = [
        'current_lesson', 'user_answer', 'user_translation', 'language_progress',
        'language_exercises_db', 'language_lessons_db', 'language_progress_db'
      ];
      
      // Znajdź wszystkie elementy do wyczyszczenia
      const contextsToClean = allContexts.filter(item => 
        titlesToClean.includes(item.title) && 
        (item.scenarioId === currentScenarioId || !item.scenarioId)
      );
      
      if (contextsToClean.length > 0) {
        const confirmText = `Znaleziono ${contextsToClean.length} elementów kontekstu nauki języka. Usunąć je wszystkie i dodać nowe?`;
        if (confirm(confirmText)) {
          // Usuń wszystkie znalezione elementy
          console.log('Usuwanie kontekstów:', contextsToClean);
          
          for (const context of contextsToClean) {
            deleteContextItem(context.id);
          }
        } else {
          // Użytkownik anulował operację
          return;
        }
      }
      // Tworzymy unikalne timestampy dla każdego kontekstu, dodając odstęp 100ms
      const baseTime = Date.now();
      
      // Najpierw dodajemy podstawowe konteksty tekstowe
      
      // Current lesson
      addContextItem({
        id: `context-current-lesson-${baseTime}`,
        title: 'current_lesson',
        content: 'lesson1',
        type: ContextType.TEXT,
        scenarioId: currentScenarioId,
        persistent: true,
        createdAt: baseTime,
        updatedAt: baseTime
      });
      
      // User answer
      addContextItem({
        id: `context-user-answer-${baseTime + 50}`,
        title: 'user_answer',
        content: '',
        type: ContextType.TEXT,
        scenarioId: currentScenarioId,
        persistent: true,
        createdAt: baseTime + 50,
        updatedAt: baseTime + 50
      });
      
      // User translation
      addContextItem({
        id: `context-user-translation-${baseTime + 100}`,
        title: 'user_translation',
        content: '',
        type: ContextType.TEXT,
        scenarioId: currentScenarioId,
        persistent: true,
        createdAt: baseTime + 100,
        updatedAt: baseTime + 100
      });
      
      // Language progress as JSON
      addContextItem({
        id: `context-language-progress-${baseTime + 150}`,
        title: 'language_progress',
        content: '{ "completed": 0, "current": "lesson1" }',
        type: ContextType.JSON,
        scenarioId: currentScenarioId,
        persistent: true,
        createdAt: baseTime + 150,
        updatedAt: baseTime + 150
      });
      
      // Add IndexedDB context for exercises
      addContextItem({
        id: `context-exercises-${baseTime + 200}`, // Dodajemy unikalny prefix
        title: 'language_exercises_db',
        content: 'language_exercises',
        type: ContextType.INDEXED_DB,
        scenarioId: currentScenarioId,
        persistent: true,
        metadata: {
          collection: 'language_exercises',
          description: 'Baza danych z ćwiczeniami do nauki języka'
        },
        createdAt: baseTime + 200,
        updatedAt: baseTime + 200
      });
      
      // Add IndexedDB context for lessons
      addContextItem({
        id: `context-lessons-${baseTime + 250}`, // Unikalny ID z inkrementacją
        title: 'language_lessons_db',
        content: 'language_lessons',
        type: ContextType.INDEXED_DB,
        scenarioId: currentScenarioId,
        persistent: true,
        metadata: {
          collection: 'language_lessons',
          description: 'Baza danych z lekcjami do nauki języka'
        },
        createdAt: baseTime + 250,
        updatedAt: baseTime + 250
      });
      
      // Add IndexedDB context for user progress
      addContextItem({
        id: `context-progress-${baseTime + 300}`, // Unikalny ID z inkrementacją
        title: 'language_progress_db',
        content: 'user_progress',
        type: ContextType.INDEXED_DB,
        scenarioId: currentScenarioId,
        persistent: true,
        metadata: {
          collection: 'user_progress',
          description: 'Baza danych z postępem użytkownika'
        },
        createdAt: baseTime + 300,
        updatedAt: baseTime + 300
      });
      
      alert('Dodano wszystkie konteksty potrzebne do nauki języka!');
    } catch (error) {
      console.error('Błąd podczas dodawania kontekstu bazy danych:', error);
      alert('Wystąpił błąd podczas dodawania kontekstu bazy danych. Sprawdź konsolę.');
    }
  };
  
  return (
    <Button
      variant="outline"
      className="gap-2"
      title="Dodaj wszystkie konteksty dla nauki języka"
      onClick={handleClick}
    >
      <Database className="h-4 w-4" />
      Dodaj konteksty języka
    </Button>
  );
};

export default AddLanguageDbContext;