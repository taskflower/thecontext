// src/templates/duolingo/flowSteps/GeneratedQuestion.tsx
import React, { useState, useEffect } from 'react';
import { FlowStepProps } from 'template-registry-module';
// Removed imports for non-existent components: Button, Input, Card

interface GeneratedQuestionData { // Renamed for clarity
  type: 'quiz' | 'text';
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  explanation: string;
}

interface ExtendedFlowStepProps extends FlowStepProps {
  node: FlowStepProps['node'] & {
    questionIndex?: number;
    generatedLesson?: {
      questions: GeneratedQuestionData[];
      lessonName: string;
      lessonDescription: string;
      difficulty: string;
    };
  };
  contextItems?: Record<string, any>[];
}

const GeneratedQuestion: React.FC<ExtendedFlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  contextItems = []
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Find generated lesson data from context if not in node
  const generatedLessonData = node.generatedLesson ||
    contextItems?.find(item => item.key === 'generatedLesson')?.value;

  // Get question index (default to 0)
  const questionIndex = node.questionIndex || 0;

  // Get the current question
  const currentQuestion = generatedLessonData?.questions?.[questionIndex];

  // Find current score from context
  const currentScore = contextItems?.find(item => item.key === 'currentScore')?.value || 0;

  useEffect(() => {
    // Log the generated data for debugging
    console.log('Generated Lesson Data:', generatedLessonData);
    console.log('Current Question:', currentQuestion);
    // Reset state when question changes
    setSelectedOption(null);
    setUserInput('');
    setShowFeedback(false);
    setIsCorrect(false);
  }, [questionIndex, generatedLessonData]); // Depend on index and data

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return; // Prevent changing after submission
    setSelectedOption(option);
  };

  const checkTextAnswer = (input: string): boolean => {
    if (!currentQuestion) return false;

    // Normalize input and answers for comparison
    const normalizedInput = input.trim().toLowerCase();
    const acceptableAnswers = currentQuestion.acceptableAnswers || [currentQuestion.correctAnswer];

    // Explicitly type 'answer' as string
    return acceptableAnswers.some((answer: string) =>
      normalizedInput === answer.trim().toLowerCase() // Ensure comparison is correct
    );
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;

    let correct = false;

    if (currentQuestion.type === 'quiz') {
      if (!selectedOption) return; // Don't submit if no option selected
      correct = selectedOption === currentQuestion.correctAnswer;
    } else { // text input
      if (!userInput.trim()) return; // Don't submit if input is empty
      correct = checkTextAnswer(userInput);
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    // Wait for feedback visibility before proceeding
    setTimeout(() => {
      // Add to the current score if correct
      const newScore = correct ? currentScore + 1 : currentScore;

      // Return both the answer and whether it was correct
      const result = {
        answer: currentQuestion.type === 'quiz' ? selectedOption : userInput,
        correct: correct,
        currentScore: newScore,
        questionIndex: questionIndex,
        questionType: currentQuestion.type,
        explanation: currentQuestion.explanation // Pass explanation too
      };

      onSubmit(JSON.stringify(result));
      // Don't reset state here, wait for useEffect on question change
    }, 1500); // Slightly shorter delay maybe
  }; // Closing brace for handleSubmit

  // --- JSX Rendering ---
  if (!currentQuestion) {
    return <div>Loading question...</div>; // Or some error state
  }

  const feedbackClass = isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
  const feedbackText = isCorrect ? 'Correct!' : `Incorrect. Correct answer: ${currentQuestion.correctAnswer}`;

  // Using standard HTML elements with Tailwind classes
  return (
    <div className="w-full max-w-lg mx-auto p-4 border rounded-lg shadow-md bg-white">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Question {questionIndex + 1}</h2>
        {/* Optional: Display lesson name/description */}
        {/* <p className="text-sm text-gray-500">{generatedLessonData?.lessonName}</p> */}
      </div>
      <div className="space-y-4">
        <p className="text-lg font-semibold">{currentQuestion.question}</p>

        {currentQuestion.type === 'quiz' && currentQuestion.options && (
          <div className="space-y-2">
            {/* Add types for option and index */}
            {currentQuestion.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                disabled={showFeedback}
                className={`w-full text-left p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedOption === option ? 'bg-blue-100 border-blue-300' : 'bg-white'
                } ${
                  showFeedback && option === currentQuestion.correctAnswer ? 'border-green-500 border-2' : ''
                } ${
                  showFeedback && selectedOption === option && !isCorrect ? 'border-red-500 border-2' : ''
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'text' && (
          <input
            type="text"
            value={userInput}
            // Add type for event 'e'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value)}
            placeholder="Type your answer here..."
            disabled={showFeedback}
            className={`mt-2 w-full p-2 border rounded disabled:opacity-50 ${
              showFeedback && !isCorrect ? 'border-red-500' : ''
            } ${
              showFeedback && isCorrect ? 'border-green-500' : ''
            }`}
          />
        )}

        {showFeedback && (
          <div className={`mt-4 p-3 rounded ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={feedbackClass}>{feedbackText}</p>
            {currentQuestion.explanation && <p className="text-sm mt-1">{currentQuestion.explanation}</p>}
          </div>
        )}
      </div>
      <div className="flex justify-between mt-6 pt-4 border-t">
         {onPrevious && questionIndex > 0 && (
           <button
             onClick={onPrevious}
             disabled={showFeedback}
             className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50"
           >
             Previous
           </button>
         )}
         {/* Ensure button is only enabled when an answer is provided */}
         <button
            onClick={handleSubmit}
            disabled={showFeedback || (currentQuestion.type === 'quiz' && !selectedOption) || (currentQuestion.type === 'text' && !userInput.trim())}
            className={`ml-auto px-4 py-2 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
              showFeedback
                ? (isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600')
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {showFeedback ? (isCorrect ? 'Correct!' : 'Incorrect') : 'Check'}
          </button>
      </div>
    </div>
  );
}; // Closing brace for GeneratedQuestion component

export default GeneratedQuestion;