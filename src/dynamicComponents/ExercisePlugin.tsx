import React, { useState } from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppStore } from '@/modules/store';

interface ExerciseData {
  exerciseId: string;
  exerciseType: 'multiple-choice' | 'translation';
  question: string;
  options?: string[];
  correctAnswer: string;
  nextExerciseId: string;
}

const ExercisePlugin: PluginComponentWithSchema<ExerciseData> = ({ 
  data, 
  appContext 
}: PluginComponentProps<ExerciseData>) => {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  
  // Ensure data is defined with fallback values
  const exerciseData: ExerciseData = {
    exerciseId: "exercise1",
    exerciseType: "multiple-choice",
    question: "How do you say 'Hello' in Spanish?",
    options: ["Hola", "Gracias", "Adiós", "Por favor"],
    correctAnswer: "Hola",
    nextExerciseId: "exercise2",
    ...(data || {})
  };
  
  const handleOptionSelect = (option: string) => {
    setAnswer(option);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };
  
  const handleSubmit = () => {
    if (!answer.trim()) return;
    
    // Check if answer is correct
    const correct = answer.toLowerCase() === exerciseData.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setSubmitted(true);
    
    // Update context with user's answer
    if (appContext?.currentNode?.id && appContext.currentNode.contextKey) {
      try {
        // Update node's user prompt
        if (appContext.updateNodeUserPrompt) {
          appContext.updateNodeUserPrompt(appContext.currentNode.id, answer);
        }
        
        // Update context directly
        const contextItems = useAppStore.getState().getContextItems();
        const contextItem = contextItems.find(
          item => item.title === appContext.currentNode?.contextKey
        );
        
        if (contextItem) {
          useAppStore.getState().updateContextItem(contextItem.id, {
            content: answer
          });
        }
      } catch (error) {
        console.error('Error updating context:', error);
      }
    }
  };
  
  const handleContinue = () => {
    setIsContinuing(true);
    
    try {
      // Update context with next exercise ID
      if (appContext?.currentNode?.contextKey) {
        const contextItems = useAppStore.getState().getContextItems();
        const contextItem = contextItems.find(
          item => item.title === appContext.currentNode?.contextKey
        );
        
        if (contextItem) {
          useAppStore.getState().updateContextItem(contextItem.id, {
            content: exerciseData.nextExerciseId
          });
        }
      }
      
      // Move to next step
      if (appContext?.nextStep) {
        appContext.nextStep();
      }
    } catch (error) {
      console.error('Error in handleContinue:', error);
    } finally {
      setIsContinuing(false);
    }
  };
  
  // Render multiple choice exercise
  if (exerciseData.exerciseType === 'multiple-choice') {
    return (
      <div className="my-8 space-y-6">
        <Card className="p-6">
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
            </div>
          )}
        </Card>
        
        {submitted ? (
          <Button 
            onClick={handleContinue}
            disabled={isContinuing}
            className="w-full py-6"
          >
            {isContinuing ? 'Loading...' : 'Continue to Next Exercise'}
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
      <Card className="p-6">
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
          </div>
        )}
      </Card>
      
      {submitted ? (
        <Button 
          onClick={handleContinue}
          disabled={isContinuing}
          className="w-full py-6"
        >
          {isContinuing ? 'Loading...' : 'Continue to Next Exercise'}
        </Button>
      ) : (
        <Button 
          onClick={handleSubmit}
          disabled={!answer.trim()}
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

ExercisePlugin.optionsSchema = {
  exerciseId: {
    type: 'string',
    label: 'Exercise ID',
    default: 'exercise1',
    description: 'Unique identifier for this exercise'
  },
  exerciseType: {
    type: 'select',
    label: 'Exercise Type',
    default: 'multiple-choice',
    options: [
      { label: 'Multiple Choice', value: 'multiple-choice' },
      { label: 'Translation', value: 'translation' }
    ],
    description: 'Type of exercise to display'
  },
  question: {
    type: 'string',
    label: 'Question',
    default: 'How do you say "Hello" in Spanish?',
    description: 'The question to ask the user'
  },
  options: {
    type: 'array',
    label: 'Answer Options',
    default: ['Hola', 'Gracias', 'Adiós', 'Por favor'],
    description: 'Options for multiple-choice questions'
  },
  correctAnswer: {
    type: 'string',
    label: 'Correct Answer',
    default: 'Hola',
    description: 'The correct answer to the question'
  },
  nextExerciseId: {
    type: 'string',
    label: 'Next Exercise ID',
    default: 'exercise2',
    description: 'ID of the next exercise to transition to'
  }
};

export default ExercisePlugin;