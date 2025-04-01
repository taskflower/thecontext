import { useState } from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/modules/store';
import { Sparkles, BookOpen, Trophy, Target } from 'lucide-react';

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
    <div className="max-w-md mx-auto pt-6 pb-10 px-4">
      {/* Lesson header with owl-like mascot styling */}
      <div className="flex justify-center mb-8">
        <div className="rounded-full bg-green-500 w-20 h-20 flex items-center justify-center">
          <BookOpen className="h-10 w-10 text-white" />
        </div>
      </div>
      
      {/* Lesson title */}
      <h2 className="text-2xl font-bold text-center mb-6">New Lesson</h2>
      
      {/* Lesson objectives */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center">
          <Target className="mr-2 h-5 w-5 text-primary" />
          Lesson Objectives
        </h3>
        <ul className="space-y-3">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
            <span>Learn new concepts</span>
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
            <span>Practice through examples</span>
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
            <span>Complete challenges</span>
          </li>
        </ul>
      </div>
      
      {/* XP reward card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-amber-500 mr-2" />
            <span className="font-bold text-amber-800">Rewards</span>
          </div>
          <div className="flex items-center bg-amber-500 text-white font-bold rounded-full px-3 py-1 text-sm">
            <Sparkles className="h-4 w-4 mr-1" />
            <span>+20 XP</span>
          </div>
        </div>
      </div>
      
      {/* Start button */}
      <Button 
        onClick={handleContinue}
        disabled={isStarting}
        className="w-full py-6 text-lg rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
      >
        {isStarting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            <span>Starting...</span>
          </div>
        ) : 'Start Lesson'}
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