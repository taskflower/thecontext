// src/themes/default/components/QuizStep.tsx
import React, { useState, useEffect } from 'react';
import { ZodType } from 'zod';
import { Check, X, HelpCircle } from 'lucide-react';
import { useFlow } from '../../../core/context';  // Dodajemy import hooka kontekstu

type Question = {
  id: string;
  question: string;
  type: 'single-choice' | 'multiple-choice' | 'true-false' | 'fill-in' | 'matching';
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  correctAnswer?: string;
  explanation?: string;
};

type UserAnswer = {
  questionId: string;
  selectedOptions: string[];
  textAnswer?: string;
  isCorrect?: boolean;
};

type QuizData = {
  title: string;
  description: string;
  questions: Question[];
};

type QuizStepProps<T> = {
  schema: ZodType<T>;
  jsonSchema?: any;
  data?: any;
  onSubmit: (data: T) => void;
  quizData: string | QuizData;  // Zmodyfikowane, aby obsługiwać zarówno string jak i obiekt
  showResults?: boolean;
};

export default function QuizStep<T>({
  schema,
  jsonSchema,
  data,
  onSubmit,
  quizData: quizDataProp,
  showResults = false,
}: QuizStepProps<T>) {
  // Dodajemy hook do pobierania danych z kontekstu
  const { get } = useFlow();
  
  // Pobieramy dane quizu z kontekstu lub bezpośrednio z propsa
  const quizData: QuizData = React.useMemo(() => {
    if (typeof quizDataProp === 'string') {
      // Jeśli to string, próbujemy pobrać dane z kontekstu Flow
      const contextData = get(quizDataProp);
      if (contextData && typeof contextData === 'object') {
        return contextData as QuizData;
      }
      console.warn(`QuizStep: Nie można pobrać danych quizu z kontekstu "${quizDataProp}"`);
      return { title: 'Quiz', description: 'Brak danych quizu', questions: [] };
    }
    // W przeciwnym razie używamy bezpośrednio przekazanego obiektu
    return quizDataProp as QuizData;
  }, [quizDataProp, get]);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeStarted, setTimeStarted] = useState<number>(Date.now());
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = quizData?.questions?.[currentQuestionIdx];
  const totalQuestions = quizData?.questions?.length || 0;
  const isLastQuestion = currentQuestionIdx === totalQuestions - 1;

  // Inicjalizacja odpowiedzi
  useEffect(() => {
    if (data?.answers && data.answers.length > 0) {
      setUserAnswers(data.answers);
    } else {
      setUserAnswers([]);
    }
    setTimeStarted(Date.now());
  }, [data]);

  // Przywrócenie stanu dla bieżącego pytania
  useEffect(() => {
    if (currentQuestion) {
      const existingAnswer = userAnswers.find(a => a.questionId === currentQuestion.id);
      
      if (existingAnswer) {
        setSelectedOptions(existingAnswer.selectedOptions || []);
        setTextAnswer(existingAnswer.textAnswer || '');
      } else {
        setSelectedOptions([]);
        setTextAnswer('');
      }
      setShowExplanation(false);
    }
  }, [currentQuestion, userAnswers]);

  // Jeśli nie ma pytań, wyświetlamy komunikat informacyjny
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="py-6 text-center">
        <h2 className="text-xl font-medium mb-4">Brak pytań quizowych</h2>
        <p className="text-gray-600 mb-6">Nie można załadować pytań quizowych. Sprawdź konfigurację.</p>
        <button
          onClick={() => onSubmit({} as T)}
          className="px-5 py-2.5 bg-black text-white rounded text-sm font-medium hover:bg-gray-800"
        >
          Kontynuuj
        </button>
      </div>
    );
  }

  const handleOptionSelect = (optionId: string) => {
    // Dla pytań jednokrotnego wyboru
    if (currentQuestion.type === 'single-choice' || currentQuestion.type === 'true-false') {
      setSelectedOptions([optionId]);
    } 
    // Dla pytań wielokrotnego wyboru
    else if (currentQuestion.type === 'multiple-choice') {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    }
  };

  const handleTextAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextAnswer(e.target.value);
  };

  const saveCurrentAnswer = () => {
    if (!currentQuestion) return;

    // Sprawdź poprawność odpowiedzi
    let isCorrect = false;
    
    if (currentQuestion.type === 'fill-in' || currentQuestion.type === 'matching') {
      isCorrect = textAnswer.toLowerCase().trim() === (currentQuestion.correctAnswer || '').toLowerCase().trim();
    } else if (currentQuestion.options) {
      // Dla single-choice i true-false
      if (currentQuestion.type === 'single-choice' || currentQuestion.type === 'true-false') {
        const selectedOption = currentQuestion.options.find(opt => selectedOptions.includes(opt.id));
        isCorrect = selectedOption?.isCorrect || false;
      } 
      // Dla multiple-choice
      else if (currentQuestion.type === 'multiple-choice') {
        // Wszystkie zaznaczone opcje muszą być poprawne i wszystkie poprawne muszą być zaznaczone
        const correctOptions = currentQuestion.options.filter(opt => opt.isCorrect).map(opt => opt.id);
        isCorrect = correctOptions.length === selectedOptions.length &&
                    correctOptions.every(id => selectedOptions.includes(id));
      }
    }

    // Aktualizuj stan odpowiedzi
    const answer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOptions: selectedOptions,
      textAnswer: currentQuestion.type === 'fill-in' || currentQuestion.type === 'matching' ? textAnswer : undefined,
      isCorrect
    };

    setUserAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === currentQuestion.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = answer;
        return updated;
      }
      return [...prev, answer];
    });
  };

  const handleNextQuestion = () => {
    saveCurrentAnswer();
    
    if (isLastQuestion) {
      completeQuiz();
    } else {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    saveCurrentAnswer();
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const completeQuiz = () => {
    const timeTaken = Math.floor((Date.now() - timeStarted) / 1000);
    const score = userAnswers.filter(a => a.isCorrect).length;
    const maxScore = totalQuestions;
    const percentage = Math.round((score / maxScore) * 100);
    
    // Przygotuj wynik
    const result = {
      answers: userAnswers,
      score,
      maxScore,
      percentage,
      timeTaken
    };
    
    setQuizCompleted(true);
    onSubmit(result as any);
  };

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <>
        <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
        
        {(currentQuestion.type === 'single-choice' || currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') && (
          <div className="space-y-3">
            {currentQuestion.options?.map(option => (
              <div 
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedOptions.includes(option.id) 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                    selectedOptions.includes(option.id) 
                      ? 'bg-white border-white' 
                      : 'border-gray-300'
                  } mr-3`}>
                    {selectedOptions.includes(option.id) && (
                      <Check className="w-4 h-4 text-black" />
                    )}
                  </div>
                  <span>{option.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {(currentQuestion.type === 'fill-in' || currentQuestion.type === 'matching') && (
          <div className="mb-4">
            <input
              type="text"
              value={textAnswer}
              onChange={handleTextAnswerChange}
              placeholder="Wpisz odpowiedź..."
              className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-black"
            />
          </div>
        )}
        
        {showExplanation && currentQuestion.explanation && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-blue-800 text-sm">
            <p className="font-medium mb-1">Wyjaśnienie:</p>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          <button
            onClick={toggleExplanation}
            className="px-4 py-2 border border-gray-200 rounded text-sm font-medium flex items-center text-gray-600 hover:bg-gray-50"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            {showExplanation ? 'Ukryj wyjaśnienie' : 'Pokaż wyjaśnienie'}
          </button>
          
          <div>
            {currentQuestionIdx > 0 && (
              <button
                onClick={handlePrevQuestion}
                className="px-4 py-2 border border-gray-200 rounded text-sm font-medium mr-2 hover:bg-gray-50"
              >
                Wstecz
              </button>
            )}
            
            <button
              onClick={handleNextQuestion}
              className="px-5 py-2 bg-black text-white rounded text-sm font-medium hover:bg-gray-800"
            >
              {isLastQuestion ? 'Zakończ' : 'Następne'}
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="pt-6">
      {!quizCompleted && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-2">{quizData.title}</h2>
            <p className="text-gray-600 text-sm">{quizData.description}</p>
            
            <div className="flex items-center justify-between mt-4 mb-2">
              <span className="text-sm font-medium">
                Pytanie {currentQuestionIdx + 1} z {totalQuestions}
              </span>
              <span className="text-sm text-gray-500">
                Ukończono: {Math.round((userAnswers.length / totalQuestions) * 100)}%
              </span>
            </div>
            
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black rounded-full"
                style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {renderQuestion()}
        </>
      )}
      
      {quizCompleted && showResults && (
        <div className="text-center py-8">
          <h2 className="text-xl font-medium mb-2">Quiz ukończony!</h2>
          <p className="text-gray-600 mb-6">Twoje odpowiedzi zostały zapisane.</p>
          <div className="inline-flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-full mb-3">
            <Check className="w-6 h-6" />
          </div>
        </div>
      )}
    </div>
  );
}