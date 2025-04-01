import React from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const [isFinishing, setIsFinishing] = React.useState(false);
  
  // Ensure data is defined with fallback values
  const lessonData: LessonCompleteData = {
    lessonId: "lesson1",
    score: 100,
    nextLessonId: "lesson2",
    ...(data || {})
  };
  
  const handleFinish = async () => {
    setIsFinishing(true);
    
    try {
      // Update context with next lesson ID if context key is provided
      if (appContext?.currentNode?.contextKey && lessonData.nextLessonId) {
        const contextItems = useAppStore.getState().getContextItems();
        const contextItem = contextItems.find(
          item => item.title === appContext.currentNode?.contextKey
        );
        
        if (contextItem) {
          useAppStore.getState().updateContextItem(contextItem.id, {
            content: lessonData.nextLessonId
          });
          console.log(`Updated context with next lesson ID: ${lessonData.nextLessonId}`);
        }
      }
      
      // Get flow session functions from store
      const stopFlowSession = useAppStore.getState().stopFlowSession;
      
      // Close the flow session and save changes
      if (stopFlowSession) {
        console.log('Stopping flow session with save=true');
        stopFlowSession(true);
      }
      
      // Move to next step
      if (appContext?.nextStep) {
        appContext.nextStep();
      }
    } catch (error) {
      console.error('Error in handleFinish:', error);
    } finally {
      setIsFinishing(false);
    }
  };
  
  return (
    <div className="my-8 space-y-6">
      <Card className="p-6 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800">
        <h3 className="text-xl font-semibold mb-2">Lesson Completed!</h3>
        <p className="text-muted-foreground">
          Congratulations on completing this lesson.
        </p>
        
        <div className="mt-4 flex items-center justify-between py-2 px-4 bg-background rounded-md">
          <span className="font-medium">Your Score</span>
          <span className="text-xl font-bold">{lessonData.score} points</span>
        </div>
      </Card>
      
      <Card className="p-6 bg-primary/10 border-primary/20">
        <h3 className="text-lg font-semibold mb-2">Up Next</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Lesson {lessonData.nextLessonId.replace('lesson', '')}</Badge>
          <span>More practice and new vocabulary</span>
        </div>
      </Card>
      
      <Button 
        onClick={handleFinish}
        disabled={isFinishing}
        className="w-full py-6 text-lg"
      >
        {isFinishing ? 'Finishing...' : 'Finish Lesson'}
      </Button>
    </div>
  );
};

LessonCompletePlugin.pluginSettings = {
  replaceUserInput: true,
  hideNavigationButtons: true
};

LessonCompletePlugin.optionsSchema = {
  lessonId: {
    type: 'string',
    label: 'Lesson ID',
    default: 'lesson1',
    description: 'ID of the completed lesson'
  },
  score: {
    type: 'number',
    label: 'Score',
    default: 100,
    description: 'Score to display for the completed lesson'
  },
  nextLessonId: {
    type: 'string',
    label: 'Next Lesson ID',
    default: 'lesson2',
    description: 'ID of the next lesson to transition to'
  }
};

export default LessonCompletePlugin;