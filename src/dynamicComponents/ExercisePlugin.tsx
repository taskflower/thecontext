import React, { useState } from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/modules/store';
import { Check, X, ChevronRight, Sparkles, Award } from 'lucide-react';

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
  
  // Render feedback after submission
  const renderFeedback = () => {
    if (!submitted) return null;
    
    return (
      <div className="my-6 flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          {isCorrect ? (
            <Check className="h-8 w-8 text-green-500" />
          ) : (
            <X className="h-8 w-8 text-red-500" />
          )}
        </div>
        
        <h3 className={`text-xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {isCorrect ? 'Great job!' : 'Not quite!'}
        </h3>
        
        {!isCorrect && (
          <div className="mt-2 text-center">
            <p className="text-muted-foreground mb-1">Correct answer:</p>
            <p className="font-semibold text-foreground">{exerciseData.correctAnswer}</p>
          </div>
        )}
        
        {isCorrect && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center">
            <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
            <span className="text-amber-800 font-semibold">+10 XP</span>
          </div>
        )}
      </div>
    );
  };
  
  // Render multiple choice exercise
  if (exerciseData.exerciseType === 'multiple-choice') {
    return (
      <div className="max-w-md mx-auto py-6 px-4">
        {/* Question */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold mb-2">Choose the correct answer</h2>
          <p className="text-lg">{exerciseData.question}</p>
        </div>
        
        {submitted ? (
          renderFeedback()
        ) : (
          /* Options */
          <div className="space-y-3 mb-8">
            {exerciseData.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                disabled={submitted}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left font-medium
                  ${answer === option 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'}`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        
        {submitted ? (
          <Button 
            onClick={handleContinue}
            disabled={isContinuing}
            className="w-full py-6 rounded-xl text-lg font-bold"
          >
            {isContinuing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span>Continue</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </div>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={!answer}
            className="w-full py-6 rounded-xl text-lg font-bold"
          >
            Check
          </Button>
        )}
        
        {/* Progress indicator */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Award className="h-4 w-4 mr-1" />
            <span>+10 XP</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Render translation exercise
  return (
    <div className="max-w-md mx-auto py-6 px-4">
      {/* Question */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold mb-2">Translate this text</h2>
        <p className="text-lg">{exerciseData.question}</p>
      </div>
      
      {submitted ? (
        renderFeedback()
      ) : (
        /* Translation input */
        <div className="mb-8">
          <Input
            value={answer}
            onChange={handleInputChange}
            placeholder="Type your answer here"
            className="w-full p-4 text-lg border-2 border-primary/30 rounded-xl focus:border-primary focus:ring-primary"
            disabled={submitted}
          />
        </div>
      )}
      
      {submitted ? (
        <Button 
          onClick={handleContinue}
          disabled={isContinuing}
          className="w-full py-6 rounded-xl text-lg font-bold"
        >
          {isContinuing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span>Continue</span>
              <ChevronRight className="ml-2 h-5 w-5" />
            </div>
          )}
        </Button>
      ) : (
        <Button 
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="w-full py-6 rounded-xl text-lg font-bold"
        >
          Check
        </Button>
      )}
      
      {/* Progress indicator */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Award className="h-4 w-4 mr-1" />
          <span>+10 XP</span>
        </div>
      </div>
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
    type: 'json',
    label: 'Answer Options',
    default: ['Hola', 'Gracias', 'Adiós', 'Por favor'],
    description: 'Options for multiple-choice questions (as JSON array)'
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