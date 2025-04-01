import { useState } from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/modules/store';

interface LessonIntroData {
  lessonId: string;
  nextExerciseId: string;
}

const LessonIntroPlugin: PluginComponentWithSchema<LessonIntroData> = ({ 
  data, 
  appContext 
}: PluginComponentProps<LessonIntroData>) => {
  const [isStarting, setIsStarting] = useState(false);
  
  // Ensure data is defined with fallback values
  const lessonData: LessonIntroData = {
    lessonId: "lesson1",
    nextExerciseId: "exercise1",
    ...(data || {})
  };
  
  const handleContinue = () => {
    setIsStarting(true);
    
    try {
      // Update context with lesson ID
      if (appContext?.currentNode?.id && appContext?.currentNode?.contextKey) {
        console.log('Updating context with lesson ID:', lessonData.lessonId);
        
        // Update context directly if possible
        const contextItems = useAppStore.getState().getContextItems();
        const contextItem = contextItems.find(
          item => item.title === appContext.currentNode?.contextKey
        );
        
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
      }
    } catch (error) {
      console.error('Error in handleContinue:', error);
    } finally {
      setIsStarting(false);
    }
  };
  
  return (
    <div className="my-8 space-y-6">
      <Card className="p-6 bg-primary/10 border-primary/20">
        <h3 className="text-xl font-semibold mb-2">Ready to begin?</h3>
        <p className="text-muted-foreground">
          You're about to start the lesson. Click the button below when you're ready to continue.
        </p>
      </Card>
      
      <Button 
        onClick={handleContinue}
        disabled={isStarting}
        className="w-full py-6 text-lg"
      >
        {isStarting ? 'Starting...' : 'Start Lesson'}
      </Button>
    </div>
  );
};

LessonIntroPlugin.pluginSettings = {
  replaceUserInput: true,
  hideNavigationButtons: true
};

LessonIntroPlugin.optionsSchema = {
  lessonId: {
    type: 'string',
    label: 'Lesson ID',
    default: 'lesson1',
    description: 'ID of the lesson to start'
  },
  nextExerciseId: {
    type: 'string',
    label: 'Next Exercise ID',
    default: 'exercise1',
    description: 'ID of the next exercise to transition to'
  }
};

export default LessonIntroPlugin;