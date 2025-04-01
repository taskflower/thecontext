import React, { useState, useEffect } from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IndexedDBService } from '@/modules/indexedDB/service';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { updateContextFromNodeInput } from '@/modules/flow/contextHandler';
import { useAppStore } from '@/modules/store';

interface MultipleChoiceExerciseData {
  exerciseId: string;
  exerciseType: 'multiple-choice' | 'translation';
  question: string;
  options?: string[];
  correctAnswer: string;
  nextExerciseId: string;
}

const ExercisePlugin: PluginComponentWithSchema<MultipleChoiceExerciseData> = ({ 
  data, 
  appContext 
}: PluginComponentProps<MultipleChoiceExerciseData>) => {
  // Ensure data is defined with fallback values to prevent null/undefined errors
  const exerciseData: MultipleChoiceExerciseData = {
    exerciseId: "default-exercise",
    exerciseType: "multiple-choice",
    question: "Sample question",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correctAnswer: "Option 1",
    nextExerciseId: "next-exercise",
    ...(data || {}) // Spread the actual data if it exists
  };
  
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [exercise, setExercise] = useState<any>(null);
  
  // Load exercise data from IndexedDB when component mounts or when exercise ID changes
  useEffect(() => {
    const loadExercise = async () => {
      let exerciseId = exerciseData.exerciseId;
      
      // If no specific exercise ID, try to get current exercise from user progress
      if (!exerciseId || exerciseId === "default-exercise") {
        try {
          console.log('No explicit exerciseId, checking user progress');
          await IndexedDBService.ensureCollection('user_progress');
          const progress = await IndexedDBService.getItem('user_progress', 'user_default');
          
          if (progress && progress.currentExerciseId) {
            exerciseId = progress.currentExerciseId;
            console.log(`Using exercise ID from user progress: ${exerciseId}`);
          }
        } catch (err) {
          console.error('Error retrieving current exercise from user progress:', err);
        }
      }
      
      // Also check context if available
      if ((!exerciseId || exerciseId === "default-exercise") && appContext?.currentNode?.contextKey) {
        try {
          console.log('Checking context for exercise ID');
          const contextItems = useAppStore.getState().getContextItems();
          const contextItem = contextItems.find(item => item.title === appContext.currentNode?.contextKey);
          
          if (contextItem && contextItem.content) {
            exerciseId = contextItem.content;
            console.log(`Using exercise ID from context: ${exerciseId}`);
          }
        } catch (err) {
          console.error('Error retrieving exercise ID from context:', err);
        }
      }
      
      if (!exerciseId || exerciseId === "default-exercise") {
        console.error('No valid exerciseId provided or found');
        return;
      }
      
      try {
        console.log('Loading exercise data for ID:', exerciseId);
        
        // Ensure collection exists
        await IndexedDBService.ensureCollection('language_exercises');
        
        // Get exercise data
        const loadedExerciseData = await IndexedDBService.getItem('language_exercises', exerciseId);
        
        if (loadedExerciseData) {
          setExercise(loadedExerciseData);
          console.log('Loaded exercise:', loadedExerciseData);
          
          // If we found a valid exercise, update the component's data
          if (exerciseId !== exerciseData.exerciseId) {
            exerciseData.exerciseId = exerciseId;
            exerciseData.exerciseType = loadedExerciseData.type || exerciseData.exerciseType;
            exerciseData.question = loadedExerciseData.question || exerciseData.question;
            
            if (loadedExerciseData.type === 'multiple-choice') {
              exerciseData.options = loadedExerciseData.options || exerciseData.options;
            }
            
            exerciseData.correctAnswer = loadedExerciseData.correctAnswer || exerciseData.correctAnswer;
            exerciseData.nextExerciseId = loadedExerciseData.nextExerciseId || null;
          }
        } else {
          console.warn('Exercise not found in IndexedDB, using plugin data instead');
          setExercise(exerciseData);
        }
        
        // Update user progress
        await IndexedDBService.ensureCollection('user_progress');
        let progress = await IndexedDBService.getItem('user_progress', 'user_default');
        
        if (!progress) {
          progress = {
            id: 'user_default',
            completedLessons: [],
            completedExercises: [],
            currentLessonId: '',
            currentExerciseId: exerciseId,
            score: 0
          };
        } else {
          progress.currentExerciseId = exerciseId;
        }
        
        await IndexedDBService.saveItem('user_progress', progress);
        console.log('Updated user progress with current exercise ID:', exerciseId);
      } catch (error) {
        console.error('Error loading exercise:', error);
      }
    };
    
    loadExercise();
  }, [exerciseData.exerciseId, appContext?.currentNode?.contextKey]);
  
  const handleOptionSelect = (option: string) => {
    setAnswer(option);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };
  
  const handleSubmit = async () => {
    console.log('ExercisePlugin: Submit button clicked');
    
    // Check if answer is correct
    const correct = answer.toLowerCase() === exerciseData.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setSubmitted(true);
    
    try {
      // Update context with user's answer - more direct approach
      if (appContext?.currentNode?.id && appContext.currentNode.contextKey) {
        console.log('Updating context from ExercisePlugin...');
        
        // First update the node's user prompt directly
        if (appContext.updateNodeUserPrompt) {
          appContext.updateNodeUserPrompt(appContext.currentNode.id, answer);
        }
        
        // Then update the context directly
        const contextItems = useAppStore.getState().getContextItems();
        const contextItem = contextItems.find(item => item.title === appContext.currentNode?.contextKey);
        
        if (contextItem) {
          useAppStore.getState().updateContextItem(contextItem.id, {
            content: answer
          });
          console.log('Context updated with:', answer);
        }
        
        // Also try the standard method
        updateContextFromNodeInput(appContext.currentNode.id);
      }
      
      // Update user progress
      await IndexedDBService.ensureCollection('user_progress');
      const progress = await IndexedDBService.getItem('user_progress', 'user_default');
      
      if (progress) {
        if (correct) {
          progress.score += 10;
          if (!progress.completedExercises.includes(exerciseData.exerciseId)) {
            progress.completedExercises.push(exerciseData.exerciseId);
          }
        }
        
        await IndexedDBService.saveItem('user_progress', progress);
        console.log('User progress updated:', progress);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };
  
  const handleContinue = async () => {
    console.log('ExercisePlugin: Continue button clicked');
    
    try {
      // Get next exercise ID either from current exercise data or from lesson data
      let nextExerciseId = exerciseData.nextExerciseId;
      
      // If not specified in the current exercise data, try to get from lesson structure
      if (!nextExerciseId && exercise?.lessonId) {
        try {
          // Get the current lesson
          const lesson = await IndexedDBService.getItem('language_lessons', exercise.lessonId);
          
          if (lesson && lesson.exercises && Array.isArray(lesson.exercises)) {
            // Find the current exercise index in the lesson
            const currentIndex = lesson.exercises.indexOf(exerciseData.exerciseId);
            
            // If found and not the last exercise, get the next one
            if (currentIndex !== -1 && currentIndex < lesson.exercises.length - 1) {
              nextExerciseId = lesson.exercises[currentIndex + 1];
              console.log(`Found next exercise ID from lesson structure: ${nextExerciseId}`);
            }
          }
        } catch (err) {
          console.error('Error finding next exercise from lesson:', err);
        }
      }
      
      console.log(`Next exercise ID: ${nextExerciseId}`);
      
      // Update user progress with next exercise ID
      if (nextExerciseId) {
        await IndexedDBService.ensureCollection('user_progress');
        const progress = await IndexedDBService.getItem('user_progress', 'user_default');
        
        if (progress) {
          progress.currentExerciseId = nextExerciseId;
          await IndexedDBService.saveItem('user_progress', progress);
          console.log(`Updated user progress with next exercise ID: ${nextExerciseId}`);
        }
        
        // Store the next exercise ID in context if a context key is provided
        if (appContext?.currentNode?.contextKey) {
          // Update context for the next step
          const contextItems = useAppStore.getState().getContextItems();
          const contextItem = contextItems.find(item => item.title === appContext.currentNode?.contextKey);
          
          if (contextItem) {
            useAppStore.getState().updateContextItem(contextItem.id, {
              content: nextExerciseId
            });
            console.log(`Updated context with next exercise ID: ${nextExerciseId}`);
          }
        }
      }
      
      // Move to next step in the flow
      if (appContext?.nextStep) {
        console.log('Moving to next step in flow...');
        appContext.nextStep();
      } else {
        console.error('nextStep function not available in appContext');
      }
    } catch (error) {
      console.error('Error in handleContinue:', error);
    }
  };
  
  // Render multiple choice exercise
  if (exerciseData.exerciseType === 'multiple-choice') {
    return (
      <div className="my-8 space-y-6">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">{exerciseData.question}</h3>
          
          <RadioGroup 
            value={answer} 
            onValueChange={handleOptionSelect}
            className="space-y-3"
            disabled={submitted}
          >
            {exerciseData.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem id={`option-${index}`} value={option} />
                <Label 
                  htmlFor={`option-${index}`}
                  className={`text-base flex-1 p-3 rounded ${submitted && option === exerciseData.correctAnswer ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
                >
                  {option}
                  {submitted && option === exerciseData.correctAnswer && (
                    <Badge variant="outline" className="ml-2">Correct</Badge>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {submitted && (
            <div className={`mt-4 p-4 rounded-md ${isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <p className="font-medium">
                {isCorrect ? '✓ Correct!' : `✗ Incorrect. The correct answer is: ${exerciseData.correctAnswer}`}
              </p>
              {exercise?.explanation && (
                <p className="mt-2 text-muted-foreground">{exercise.explanation}</p>
              )}
            </div>
          )}
        </div>
        
        {submitted ? (
          <Button 
            onClick={handleContinue}
            className="w-full py-6"
          >
            Continue to Next Exercise
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={!answer}
            className="w-full py-6"
          >
            Check Answer
          </Button>
        )}
      </div>
    );
  }
  
  // Render translation exercise
  return (
    <div className="my-8 space-y-6">
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-xl font-semibold mb-4">{exerciseData.question}</h3>
        
        <div className="space-y-3">
          <Label htmlFor="translation-input" className="text-base">
            Your translation:
          </Label>
          <Input
            id="translation-input"
            value={answer}
            onChange={handleInputChange}
            placeholder="Type your answer here"
            className="w-full py-6 text-lg"
            disabled={submitted}
          />
        </div>
        
        {submitted && (
          <div className={`mt-4 p-4 rounded-md ${isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <p className="font-medium">
              {isCorrect ? '✓ Correct!' : `✗ Incorrect. The correct answer is: ${exerciseData.correctAnswer}`}
            </p>
            {exercise?.explanation && (
              <p className="mt-2 text-muted-foreground">{exercise.explanation}</p>
            )}
          </div>
        )}
      </div>
      
      {submitted ? (
        <Button 
          onClick={handleContinue}
          className="w-full py-6"
        >
          Continue to Next Exercise
        </Button>
      ) : (
        <Button 
          onClick={handleSubmit}
          disabled={!answer}
          className="w-full py-6"
        >
          Check Answer
        </Button>
      )}
    </div>
  );
};

ExercisePlugin.pluginSettings = {
  replaceUserInput: true,
  hideNavigationButtons: true
};

export default ExercisePlugin;