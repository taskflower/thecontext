import React from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/modules/store';
import { Sparkles, Trophy, Star, ChevronRight, BookOpen, ArrowRight } from 'lucide-react';

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
    <div className="max-w-md mx-auto py-6 px-4">
      {/* Celebration header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center mb-4">
          <Trophy className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-1">Lesson Completed!</h2>
        <p className="text-muted-foreground text-center">Great job! You've mastered this material.</p>
      </div>
      
      {/* XP and score animation */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-center mb-3">
          <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
          <span className="font-bold text-amber-800">Rewards Earned</span>
        </div>
        
        <div className="flex justify-center">
          <div className="flex items-center justify-center bg-amber-500 text-white font-bold rounded-full px-6 py-2 text-lg">
            <Star className="h-6 w-6 mr-2" />
            <span>+{lessonData.score} XP</span>
          </div>
        </div>
      </div>
      
      {/* Streak card */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mr-3">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Daily Streak</p>
              <p className="font-bold text-lg">7 days</p>
            </div>
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            +1
          </div>
        </div>
      </div>
      
      {/* Next lesson preview */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <h3 className="font-bold mb-3 flex items-center">
          <BookOpen className="h-5 w-5 text-primary mr-2" />
          Up Next
        </h3>
        
        <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
          <Badge className="bg-primary text-primary-foreground">
            Lesson {lessonData.nextLessonId.replace('lesson', '')}
          </Badge>
          <span className="text-sm">New vocabulary & expressions</span>
          <ArrowRight className="h-4 w-4 text-primary ml-auto" />
        </div>
      </div>
      
      {/* Continue button */}
      <Button 
        onClick={handleFinish}
        disabled={isFinishing}
        className="w-full py-6 rounded-xl text-lg font-bold transition-transform active:scale-95"
      >
        {isFinishing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            <span>Saving progress...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span>Continue</span>
            <ChevronRight className="h-5 w-5 ml-2" />
          </div>
        )}
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