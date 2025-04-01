import React, { useEffect } from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Button } from '@/components/ui/button';
import { IndexedDBService } from '@/modules/indexedDB/service';
import { useAppStore } from '@/modules/store';

interface LessonIntroData {
  lessonId: string;
  nextExerciseId: string;
}

const LessonIntroPlugin: PluginComponentWithSchema<LessonIntroData> = ({ 
  data, 
  appContext 
}: PluginComponentProps<LessonIntroData>) => {
  // Ensure data is defined with fallback values to prevent null/undefined errors
  const lessonData: LessonIntroData = {
    lessonId: "lesson1",
    nextExerciseId: "exercise1",
    ...(data || {}) // Spread the actual data if it exists
  };
  
  // Load lesson data from IndexedDB when component mounts
  useEffect(() => {
    const loadLesson = async () => {
      if (!lessonData.lessonId) {
        console.error('No lessonId provided');
        return;
      }
      
      try {
        console.log('Loading lesson data for ID:', lessonData.lessonId);
        
        // Ensure collection exists
        await IndexedDBService.ensureCollection('language_lessons');
        
        // Get lesson data
        const lesson = await IndexedDBService.getItem('language_lessons', lessonData.lessonId);
        console.log('Loaded lesson:', lesson);
        
        // Update user progress
        await IndexedDBService.ensureCollection('user_progress');
        let progress = await IndexedDBService.getItem('user_progress', 'user_default');
        
        if (!progress) {
          progress = {
            id: 'user_default',
            completedLessons: [],
            completedExercises: [],
            currentLessonId: lessonData.lessonId,
            currentExerciseId: lessonData.nextExerciseId,
            score: 0
          };
        } else {
          progress.currentLessonId = lessonData.lessonId;
          progress.currentExerciseId = lessonData.nextExerciseId;
        }
        
        await IndexedDBService.saveItem('user_progress', progress);
      } catch (error) {
        console.error('Error loading lesson:', error);
      }
    };
    
    loadLesson();
  }, [lessonData.lessonId, lessonData.nextExerciseId]);
  
  const handleContinue = () => {
    console.log('LessonIntroPlugin: Continue button clicked');
    
    try {
      // Directly update the context to ensure it works
      if (appContext?.currentNode?.id && appContext?.currentNode?.contextKey) {
        console.log('Updating context from LessonIntroPlugin...');
        
        // Set in the store directly
        const contextItems = useAppStore.getState().getContextItems();
        const contextItem = contextItems.find(item => item.title === appContext.currentNode?.contextKey);
        
        if (contextItem) {
          useAppStore.getState().updateContextItem(contextItem.id, {
            content: lessonData.lessonId
          });
          console.log('Context updated with:', lessonData.lessonId);
        }
      }
      
      // Move to next step
      if (appContext?.nextStep) {
        console.log('Moving to next step...');
        appContext.nextStep();
      } else {
        console.error('nextStep function not available in appContext');
      }
    } catch (error) {
      console.error('Error in handleContinue:', error);
    }
  };
  
  return (
    <div className="my-8 space-y-6">
      <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
        <h3 className="text-xl font-semibold mb-2">Ready to begin?</h3>
        <p className="text-muted-foreground">
          You're about to start the lesson. Click the button below when you're ready to continue.
        </p>
      </div>
      
      <Button 
        onClick={handleContinue}
        className="w-full py-6 text-lg"
      >
        Start Lesson
      </Button>
    </div>
  );
};

LessonIntroPlugin.pluginSettings = {
  replaceUserInput: true,
  hideNavigationButtons: true
};

export default LessonIntroPlugin;