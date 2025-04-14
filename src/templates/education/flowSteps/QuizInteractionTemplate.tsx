// src/templates/education/flowSteps/QuizInteractionTemplate.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { useAppStore } from '@/lib/store';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import SafeContent from '../resources/SafeContent';


const QuizInteractionTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  // Stany komponentu
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Pobierz store i dane kontekstowe
  const processTemplate = useAppStore(state => state.processTemplate);
  const getContextPath = useAppStore(state => state.getContextPath);

  // Hook do obsługi IndexedDB
  const { saveItem } = useIndexedDB();

  // Pobierz wygenerowany quiz
  const quizContent = getContextPath('generatedContent') || {};
  const questions = Array.isArray(quizContent.pytania) ? quizContent.pytania : [];
  const includeExplanations = getContextPath('quizResults.includeExplanations') === 'Tak';
  const learningSession = getContextPath('learningSession') || {};
  
  // Przetwórz wiadomość asystenta
  const processedMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';

  // Oblicz wynik quizu
  const calculateScore = () => {
    if (!questions.length) return { correct: 0, total: 0, percentage: 0 };
    
    const correctAnswers = questions.filter((q: any, index: number) => {
      const userAnswer = userAnswers[index];
      const correctAnswer = q && typeof q === 'object' ? q.poprawna_odpowiedz : null;
      return userAnswer === correctAnswer;
    }).length;
    
    return {
      correct: correctAnswers,
      total: questions.length,
      percentage: Math.round((correctAnswers / questions.length) * 100)
    };
  };

  // Obsługa zatwierdzenia quizu
  const handleSubmitQuiz = () => {
    if (showResults) {
      // Quiz zakończony, zapisz wyniki i przejdź dalej
      const score = calculateScore();
      onSubmit({
        score,
        userAnswers,
        completedAt: new Date().toISOString()
      });
    } else {
      // Pokaż wyniki quizu
      setShowResults(true);
    }
  };

  // Funkcja zapisująca quiz do IndexedDB
  const handleSaveQuiz = async () => {
    if (!quizContent || !quizContent.tytul_quizu) {
      setSaveStatus('error');
      return;
    }
    
    try {
      setSaveStatus('saving');
      
      // Generuj unikalny identyfikator
      const id = `quiz_${learningSession.subject}_${learningSession.topic}`.replace(/\s+/g, '_').toLowerCase();
      
      const score = calculateScore();
      
      await saveItem({
        id,
        type: 'quiz',
        title: quizContent.tytul_quizu || 'Quiz',
        content: {
          quizContent,
          learningSession,
          userAnswers,
          score,
          completedAt: new Date().toISOString()
        }
      });
      
      setSaveStatus('saved');
      
      // Reset statusu po 3 sekundach
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Błąd podczas zapisywania quizu:', error);
      setSaveStatus('error');
    }
  };

  // Obsługa wyboru odpowiedzi
  const handleAnswerSelect = (answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: answer
    });
  };

  // Obsługa nawigacji między pytaniami
  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Bezpieczne pobieranie wartości z pytania
  const getQuestionValue = (question: any, key: string, defaultValue: string = ''): string => {
    if (!question || typeof question !== 'object') {
      return defaultValue;
    }
    
    const value = question[key];
    if (value === undefined || value === null) {
      return defaultValue;
    }
    
    return typeof value === 'string' ? value : String(value);
  };

  // Obsługa renderowania pytania
  const renderQuestion = () => {
    if (!questions.length) {
      return <p className="text-gray-500 italic">Brak dostępnych pytań</p>;
    }

    const question = questions[currentQuestion];
    if (!question || typeof question !== 'object') {
      return <p className="text-gray-500 italic">Nieprawidłowy format pytania</p>;
    }

    const questionText = getQuestionValue(question, 'tresc', 'Brak treści pytania');
    const questionType = getQuestionValue(question, 'typ', 'Wybór');
    const correctAnswer = getQuestionValue(question, 'poprawna_odpowiedz');
    const explanation = getQuestionValue(question, 'wyjasnienie');
    
    const userAnswer = userAnswers[currentQuestion];
    const isCorrect = showResults && userAnswer === correctAnswer;
    const isIncorrect = showResults && userAnswer && userAnswer !== correctAnswer;

    // Bezpieczne pobieranie odpowiedzi
    let answers: string[] = [];
    if (question.odpowiedzi) {
      if (Array.isArray(question.odpowiedzi)) {
        answers = question.odpowiedzi.map((a:any) => typeof a === 'string' ? a : String(a));
      } else {
        console.warn('Odpowiedzi nie są tablicą:', question.odpowiedzi);
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-500">
            Pytanie {currentQuestion + 1} z {questions.length}
          </span>
          
          <span className="text-sm font-medium text-gray-500">
            {questionType}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold">
          <SafeContent content={questionText} />
        </h3>
        
        <div className="space-y-2">
          {answers.length > 0 ? (
            answers.map((answer, idx) => (
              <div 
                key={idx}
                onClick={() => !showResults && handleAnswerSelect(answer)}
                className={`p-3 rounded-lg cursor-pointer border ${
                  userAnswer === answer 
                    ? isCorrect 
                      ? 'bg-green-100 border-green-300' 
                      : isIncorrect 
                        ? 'bg-red-100 border-red-300'
                        : 'bg-blue-100 border-blue-300'
                    : showResults && answer === correctAnswer
                      ? 'bg-green-100 border-green-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between">
                  <span><SafeContent content={answer} /></span>
                  {showResults && (
                    <span>
                      {answer === correctAnswer && (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                        </svg>
                      )}
                      {isIncorrect && userAnswer === answer && (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"></path>
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Brak dostępnych odpowiedzi</p>
          )}
        </div>
        
        {showResults && includeExplanations && explanation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-medium">Wyjaśnienie:</p>
            <p><SafeContent content={explanation} /></p>
          </div>
        )}
      </div>
    );
  };

  // Renderuj przycisk zapisu z odpowiednim statusem
  const renderSaveButton = () => {
    if (!showResults) return null; // Pokaż przycisk zapisu tylko po zakończeniu quizu
    
    // Style przycisku w zależności od statusu
    const getButtonStyle = () => {
      switch(saveStatus) {
        case 'saving':
          return 'bg-yellow-500 text-white';
        case 'saved':
          return 'bg-green-500 text-white';
        case 'error':
          return 'bg-red-500 text-white';
        default:
          return 'bg-indigo-600 hover:bg-indigo-700 text-white';
      }
    };

    // Tekst przycisku w zależności od statusu
    const getButtonText = () => {
      switch(saveStatus) {
        case 'saving':
          return 'Zapisywanie...';
        case 'saved':
          return 'Zapisano!';
        case 'error':
          return 'Błąd zapisu';
        default:
          return 'Zapisz wyniki';
      }
    };

    return (
      <button
        onClick={handleSaveQuiz}
        disabled={saveStatus === 'saving' || saveStatus === 'saved'}
        className={`px-4 py-2 rounded ${getButtonStyle()} transition-colors duration-300`}
      >
        {getButtonText()}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Wiadomość asystenta */}
      {processedMessage && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="whitespace-pre-line">{processedMessage}</p>
        </div>
      )}
      
      {/* Nagłówek quizu */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg text-white">
        <h2 className="text-xl font-bold">
          <SafeContent content={quizContent.tytul_quizu || 'Quiz wiedzy'} />
        </h2>
        <p className="text-sm opacity-80">
          Poziom trudności: <SafeContent content={quizContent.poziom_trudnosci || 'dostosowany'} />
        </p>
      </div>
      
      {/* Zawartość quizu */}
      <div className="p-4 bg-white rounded-lg shadow border">
        {showResults && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="font-semibold">Twój wynik: {calculateScore().correct}/{calculateScore().total} ({calculateScore().percentage}%)</p>
          </div>
        )}
        
        {renderQuestion()}
        
        {/* Nawigacja pytań */}
        <div className="flex justify-between mt-6">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Poprzednie
          </button>
          
          <div className="flex space-x-1">
            {questions.map((_, idx:any) => (
              <div 
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  idx === currentQuestion 
                    ? 'bg-blue-600' 
                    : userAnswers[idx] 
                      ? 'bg-blue-300' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={goToNextQuestion}
            disabled={currentQuestion === questions.length - 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Następne
          </button>
        </div>
      </div>
      
      {/* Przyciski nawigacyjne */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Wstecz
        </button>
        
        <div className="flex space-x-3">
          {renderSaveButton()}
          
          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(userAnswers).length < questions.length && !showResults}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
          >
            {showResults ? (isLastNode ? 'Zakończ' : 'Kontynuuj') : 'Sprawdź wyniki'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizInteractionTemplate;