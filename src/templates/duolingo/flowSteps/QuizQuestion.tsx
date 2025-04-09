// src/templates/duolingo/flowSteps/QuizQuestion.tsx
import React, { useState, useEffect } from 'react';
import { FlowStepProps } from 'template-registry-module';

interface ExtendedFlowStepProps extends FlowStepProps {
  node: FlowStepProps['node'] & {
    quizOptions?: string[];
    correctAnswer?: string;
    explanation?: string;
    assistantMessage?: string; // Added based on usage in JSX
  };
  contextItems?: Record<string, any>[];
}

const QuizQuestion: React.FC<ExtendedFlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  contextItems = []
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Get options, answer, explanation, and question text from node
  // Provide sensible defaults if they are missing
  const options = node.quizOptions || ['Option A', 'Option B', 'Option C', 'Option D'];
  const correctAnswer = node.correctAnswer || options[0]; // Default to first option if missing
  const explanation = node.explanation || 'No explanation provided for this answer.';
  const questionText = node.assistantMessage || 'Please select the correct answer:';

  // Find current score from context (optional, might not be needed here)
  const currentScore = contextItems?.find(item => item.key === 'currentScore')?.value || 0;

  // Reset state if the node changes (e.g., navigating back/forth)
  useEffect(() => {
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
  }, [node]);

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return; // Prevent changing after submission
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return; // Don't submit if nothing selected

    const correct = selectedOption === correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Wait for feedback visibility before proceeding
    setTimeout(() => {
      // Calculate new score (if tracking score here)
      const newScore = correct ? currentScore + 1 : currentScore;

      // Return the selected answer and correctness
      const result = {
        answer: selectedOption,
        correct: correct,
        // currentScore: newScore // Only include if score is managed/needed by this step
      };

      onSubmit(JSON.stringify(result));
      // Don't reset state here, wait for useEffect on node change
    }, 1500); // Adjust delay as needed
  };

  // --- Correct JSX Rendering for QuizQuestion ---
  return (
    <div className="w-full max-w-lg mx-auto p-4 border rounded-lg shadow-md bg-white">
      {/* Optional Progress - simplified or removed if not applicable */}
      {/* <div className="w-full bg-gray-200 h-2 mb-4">
        <div className="bg-green-500 h-2" style={{ width: '30%' }}></div>
      </div> */}

      <div className="p-2"> {/* Adjusted padding */}
        {/* Question Text */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {questionText}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {/* Add types for option and index */}
          {options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              disabled={showFeedback}
              className={`w-full text-left p-3 border rounded-lg transition-all hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed ${
                selectedOption === option
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-300' // Style for selected
                  : 'border-gray-300 bg-white'
              } ${ // Feedback styling
                showFeedback && option === correctAnswer ? 'border-green-500 bg-green-50 border-2' : '' // Correct answer highlight
              } ${
                showFeedback && selectedOption === option && !isCorrect ? 'border-red-500 bg-red-50 border-2' : '' // Incorrect selection highlight
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {/* Feedback Icons */}
                {showFeedback && selectedOption === option && (
                  <span>
                    {isCorrect ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                )}
                 {/* Icon on the actual correct answer if wrong one was selected */}
                 {showFeedback && !isCorrect && option === correctAnswer && selectedOption !== option && (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                   </svg>
                 )}
              </div>
            </button>
          ))}
        </div>

        {/* Feedback Text Area */}
        {showFeedback && (
          <div className={`p-3 rounded-lg mb-6 text-sm ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                 {isCorrect ? (
                   <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 ) : (
                   <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 )}
              </div>
              <div className="ml-3">
                <h3 className="font-medium">
                  {isCorrect ? 'Excellent!' : 'Incorrect Answer'}
                </h3>
                <div className="mt-1">
                  <p>{explanation}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          {onPrevious && ( // Conditionally render Previous button
            <button
              onClick={onPrevious}
              disabled={showFeedback} // Disable during feedback
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || showFeedback} // Disable if no selection or during feedback
            className={`ml-auto px-5 py-2 rounded-lg text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              !selectedOption || showFeedback
                ? 'bg-gray-400' // Disabled style
                : 'bg-green-500 hover:bg-green-600' // Enabled style
            } ${ // Style update during feedback
              showFeedback ? (isCorrect ? 'bg-green-600' : 'bg-red-600') : ''
            }`}
          >
            {showFeedback ? (isCorrect ? 'Correct!' : 'Incorrect') : 'Check'}
          </button>
        </div>
      </div>
    </div>
  );
}; // Closing brace for QuizQuestion component

export default QuizQuestion;