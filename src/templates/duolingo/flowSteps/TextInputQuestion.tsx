// src/templates/duolingo/flowSteps/TextInputQuestion.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';

interface ExtendedFlowStepProps extends FlowStepProps {
  node: FlowStepProps['node'] & {
    correctAnswer?: string;
    acceptableAnswers?: string[];
    explanation?: string;
  };
  contextItems?: Record<string, any>[];
}

const TextInputQuestion: React.FC<ExtendedFlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode,
  contextItems = []
}) => {
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Get answer data from node
  const correctAnswer = node.correctAnswer || '';
  const acceptableAnswers = node.acceptableAnswers || [correctAnswer];
  const explanation = node.explanation || 'Brak wyjaśnienia dla tej odpowiedzi.';
  
  // Find current score from context
  const currentScore = contextItems?.find(item => item.key === 'currentScore')?.value || 0;
  
  const checkAnswer = (input: string): boolean => {
    // Normalize input and answers for comparison
    const normalizedInput = input.trim().toLowerCase();
    return acceptableAnswers.some(answer => 
      normalizedInput === answer.trim().toLowerCase()
    );
  };
  
  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    const correct = checkAnswer(userInput);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Wait for animation before proceeding
    setTimeout(() => {
      // Add to the current score if correct
      const newScore = correct ? currentScore + 1 : currentScore;
      
      // Return both the answer and whether it was correct
      const result = {
        answer: userInput,
        correct: correct,
        currentScore: newScore
      };
      
      onSubmit(JSON.stringify(result));
      setUserInput('');
      setShowFeedback(false);
    }, 2000);
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-2">
        <div className="bg-green-500 h-2" style={{ width: '60%' }}></div>
      </div>
      
      <div className="p-6">
        {/* Question */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {node.assistantMessage || 'Podaj odpowiedź:'}
          </h2>
        </div>
        
        {/* Text input */}
        <div className="mb-6">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Wpisz odpowiedź tutaj..."
            className={`w-full p-4 border-2 rounded-lg transition-colors ${
              showFeedback
                ? isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
            }`}
            disabled={showFeedback}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && userInput.trim()) {
                handleSubmit();
              }
            }}
          />
        </div>
        
        {/* Feedback */}
        {showFeedback && (
          <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {isCorrect ? (
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  {isCorrect ? 'Doskonale!' : 'Niepoprawna odpowiedź'}
                </h3>
                <div className="mt-1 text-sm">
                  {!isCorrect && (
                    <p className="font-medium">Poprawna odpowiedź: {correctAnswer}</p>
                  )}
                  <p>{explanation}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onPrevious}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Wstecz
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim() || showFeedback}
            className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${
              !userInput.trim() || showFeedback
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            Sprawdź
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextInputQuestion;