import React, { useEffect, useState } from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Button } from '@/components/ui/button';
import { IndexedDBService } from '@/modules/indexedDB/service';
import { useAppStore } from '@/modules/store';

interface LessonCompleteData {
  lessonId: string;
  score: number;
  nextLessonId: string;
}

const LessonCompletePlugin: PluginComponentWithSchema<LessonCompleteData> = ({ 
  data, 
  appContext 
}: PluginComponentProps<LessonCompleteData>) => {
  // Ensure data is defined with fallback values to prevent null/undefined errors
  const lessonData: LessonCompleteData = {
    lessonId: "lesson1",
    score: 100,
    nextLessonId: "lesson2",
    ...(data || {}) // Spread the actual data if it exists
  };
  
  const [userScore, setUserScore] = useState(0);
  const [lesson, setLesson] = useState<any>(null);
  const [nextLesson, setNextLesson] = useState<any>(null);
  
  // Get stop flow session function from store
  const stopFlowSession = useAppStore(state => state.stopFlowSession);
  
  // Load user progress and mark lesson as completed
  useEffect(() => {
    const updateProgress = async () => {
      if (!lessonData.lessonId) {
        console.error('No lessonId provided');
        return;
      }
      
      try {
        console.log('Updating progress for lesson ID:', lessonData.lessonId);
        
        // Get user progress
        await IndexedDBService.ensureCollection('user_progress');
        const progress = await IndexedDBService.getItem('user_progress', 'user_default');
        
        if (progress) {
          // Mark lesson as completed
          if (!progress.completedLessons.includes(lessonData.lessonId)) {
            progress.completedLessons.push(lessonData.lessonId);
          }
          
          // Update next lesson
          progress.currentLessonId = lessonData.nextLessonId;
          
          // Save progress
          await IndexedDBService.saveItem('user_progress', progress);
          
          // Set user score
          setUserScore(progress.score);
          console.log('Updated user score:', progress.score);
        } else {
          console.warn('No user progress found');
        }
        
        // Get lesson info
        await IndexedDBService.ensureCollection('language_lessons');
        const currentLesson = await IndexedDBService.getItem('language_lessons', lessonData.lessonId);
        setLesson(currentLesson || { title: 'Lesson ' + lessonData.lessonId });
        console.log('Loaded current lesson:', currentLesson);
        
        // Get next lesson info
        const next = await IndexedDBService.getItem('language_lessons', lessonData.nextLessonId);
        setNextLesson(next || { title: 'Lesson ' + lessonData.nextLessonId });
        console.log('Loaded next lesson:', next);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    };
    
    updateProgress();
  }, [lessonData.lessonId, lessonData.nextLessonId]);
  
  const handleFinish = async () => {
    console.log('LessonCompletePlugin: Finish button clicked');
    
    try {
      // Update context with next lesson ID if context key is provided
      if (appContext?.currentNode?.contextKey && lessonData.nextLessonId) {
        try {
          const contextItems = useAppStore.getState().getContextItems();
          const contextItem = contextItems.find(item => item.title === appContext.currentNode?.contextKey);
          
          if (contextItem) {
            useAppStore.getState().updateContextItem(contextItem.id, {
              content: lessonData.nextLessonId
            });
            console.log(`Updated context with next lesson ID: ${lessonData.nextLessonId}`);
          }
        } catch (err) {
          console.error('Error updating context with next lesson ID:', err);
        }
      }
      
      // If next lesson exists, set up first exercise
      if (nextLesson && nextLesson.exercises && nextLesson.exercises.length > 0) {
        try {
          await IndexedDBService.ensureCollection('user_progress');
          const progress = await IndexedDBService.getItem('user_progress', 'user_default');
          
          if (progress) {
            // Set first exercise of next lesson as current
            progress.currentExerciseId = nextLesson.exercises[0];
            await IndexedDBService.saveItem('user_progress', progress);
            console.log(`Updated current exercise to ${progress.currentExerciseId} from next lesson`);
          }
        } catch (err) {
          console.error('Error updating exercise for next lesson:', err);
        }
      }
      
      // Close the flow session and save changes
      if (stopFlowSession) {
        console.log('Stopping flow session with save=true');
        stopFlowSession(true);
      } else {
        console.error('stopFlowSession function not available');
      }
      
      // Move to next step
      if (appContext?.nextStep) {
        console.log('Moving to next step...');
        appContext.nextStep();
      } else {
        console.error('nextStep function not available in appContext');
      }
    } catch (error) {
      console.error('Error in handleFinish:', error);
    }
  };
  
  return (
    <div className="my-8 space-y-6">
      <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="text-xl font-semibold mb-2">Lesson Completed!</h3>
        <p className="text-muted-foreground">
          Congratulations on completing {lesson?.title || 'this lesson'}.
        </p>
        
        <div className="mt-4 flex items-center justify-between py-2 px-4 bg-background rounded-md">
          <span className="font-medium">Your Score</span>
          <span className="text-xl font-bold">{userScore} points</span>
        </div>
      </div>
      
      {nextLesson && (
        <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
          <h3 className="text-lg font-semibold mb-2">Up Next</h3>
          <p className="font-medium">{nextLesson.title}</p>
          <p className="text-sm text-muted-foreground">{nextLesson.description}</p>
        </div>
      )}
      
      <Button 
        onClick={handleFinish}
        className="w-full py-6 text-lg"
      >
        Finish Lesson
      </Button>
    </div>
  );
};

LessonCompletePlugin.pluginSettings = {
  replaceUserInput: true,
  hideNavigationButtons: true
};

export default LessonCompletePlugin;