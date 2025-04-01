// src/components/exercises/ExerciseListButton.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Books, Loader, Database, CheckCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { IndexedDBService } from '@/modules/indexedDB/service';
import { useAppStore } from "@/modules/store";
import { ContextType } from '@/modules/context/types';

type Exercise = {
  id: string;
  lessonId: string;
  type: string;
  question: string;
  correctAnswer: string;
  explanation?: string;
  order: number;
  options?: string[];
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  level: string;
  language: string;
  order: number;
  exercises: string[];
  completed: boolean;
};

const ExerciseListButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasLanguageDbContext, setHasLanguageDbContext] = useState(false);

  // Get context operations from store
  const addContextItem = useAppStore((state) => state.addContextItem);
  
  // Pobieramy currentScenario tylko raz, nie będziemy śledzić jego zmian
  const currentScenarioId = useAppStore.getState().selected.scenario;
  
  // Check if language DB context exists
  useEffect(() => {
    const checkLanguageDbContext = () => {
      // Użyj API stanu bezpośrednio, bez użycia getContextItems
      const state = useAppStore.getState();
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (!workspace?.contextItems) return;
      
      const dbContext = workspace.contextItems.find(item => 
        item.type === ContextType.INDEXED_DB && 
        (item.title === 'language_exercises_db' || item.content === 'language_exercises')
      );
      setHasLanguageDbContext(!!dbContext);
    };
    
    checkLanguageDbContext();
  }, [/* brak zależności, wykona się tylko raz */]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Check if collections exist
      const collections = await IndexedDBService.getCollections();
      const hasLessons = collections.includes('language_lessons');
      const hasExercises = collections.includes('language_exercises');
      
      if (!hasLessons || !hasExercises) {
        console.log('Language collections not found - initializing data first');
        await initializeData();
      }
      
      // Load lessons
      const lessonsData = await IndexedDBService.getAll<Lesson>('language_lessons');
      setLessons(lessonsData.sort((a, b) => a.order - b.order));
      
      // Load exercises
      const exercisesData = await IndexedDBService.getAll<Exercise>('language_exercises');
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error loading language data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeData = async () => {
    setIsInitializing(true);
    try {
      // Dynamically import the setup function
      const { setupLanguageLearningData } = await import('@/modules/indexedDB/setupLanguageLearning');
      
      // Force reinitialization of data
      const result = await setupLanguageLearningData(true);
      if (result) {
        console.log('Language learning data initialized successfully!');
      } else {
        console.error('Failed to initialize language learning data.');
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddDbContext = () => {
    if (!currentScenarioId) {
      alert('Musisz najpierw wybrać scenariusz!');
      return;
    }
    
    // Add IndexedDB context for exercises
    addContextItem({
      title: 'language_exercises_db',
      content: 'language_exercises',
      type: ContextType.INDEXED_DB,
      scenarioId: currentScenarioId,
      persistent: true,
      metadata: {
        collection: 'language_exercises',
        description: 'Baza danych z ćwiczeniami do nauki języka'
      }
    });
    
    // Add IndexedDB context for lessons
    addContextItem({
      title: 'language_lessons_db',
      content: 'language_lessons',
      type: ContextType.INDEXED_DB,
      scenarioId: currentScenarioId,
      persistent: true,
      metadata: {
        collection: 'language_lessons',
        description: 'Baza danych z lekcjami do nauki języka'
      }
    });
    
    // Add IndexedDB context for user progress
    addContextItem({
      title: 'language_progress_db',
      content: 'user_progress',
      type: ContextType.INDEXED_DB,
      scenarioId: currentScenarioId,
      persistent: true,
      metadata: {
        collection: 'user_progress',
        description: 'Baza danych z postępem użytkownika'
      }
    });
    
    setHasLanguageDbContext(true);
  };
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    loadData();
  };
  
  return (
    <>
      <Button
        variant="outline"
        className="gap-2"
        title="Lista ćwiczeń językowych"
        onClick={handleOpenDialog}
      >
        <Books className="h-4 w-4" />
        Ćwiczenia
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl h-[500px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Lekcje i ćwiczenia językowe</DialogTitle>
            <DialogDescription>
              Lista dostępnych lekcji i ćwiczeń do nauki języka. Możesz dodać kontekst bazy danych do swojego scenariusza.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto p-4 border rounded-md mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="h-6 w-6 animate-spin mr-2" />
                <span>Ładowanie danych...</span>
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-muted-foreground">Brak danych do wyświetlenia.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={initializeData}
                  disabled={isInitializing}
                >
                  {isInitializing ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Inicjalizacja...
                    </>
                  ) : (
                    'Inicjalizuj dane'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {lessons.map(lesson => (
                  <div key={lesson.id} className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-2">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{lesson.description}</p>
                    <div className="space-y-3 pl-4">
                      {lesson.exercises
                        .map(exId => exercises.find(ex => ex.id === exId))
                        .filter(Boolean)
                        .map((exercise, index) => exercise && (
                          <div key={exercise.id} className="bg-muted/30 p-3 rounded-md">
                            <div className="flex justify-between">
                              <span className="font-medium">Ćwiczenie {index + 1}</span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                                {exercise.type}
                              </span>
                            </div>
                            <p className="mt-1">{exercise.question}</p>
                            {exercise.options && (
                              <div className="mt-2 pl-4 space-y-1">
                                {exercise.options.map(option => (
                                  <div key={option} className="text-sm">
                                    {option === exercise.correctAnswer ? (
                                      <span className="text-green-600 dark:text-green-400">✓ {option}</span>
                                    ) : (
                                      <span>{option}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {!exercise.options && (
                              <div className="mt-2 text-sm">
                                <span className="text-green-600 dark:text-green-400">Odpowiedź: {exercise.correctAnswer}</span>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <div>
              {!hasLanguageDbContext && (
                <Button 
                  onClick={handleAddDbContext}
                  variant="secondary"
                  className="gap-2"
                >
                  <Database className="h-4 w-4" />
                  Dodaj kontekst bazy danych
                </Button>
              )}
              {hasLanguageDbContext && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Kontekst bazy danych dodany
                </span>
              )}
            </div>
            <Button 
              onClick={() => setIsDialogOpen(false)}
            >
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExerciseListButton;