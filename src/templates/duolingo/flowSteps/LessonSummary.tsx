// src/templates/duolingo/flowSteps/LessonSummary.tsx
import React, { useEffect, useState } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { useAuth } from '@/hooks/useAuth';

interface ExtendedFlowStepProps extends FlowStepProps {
  node: FlowStepProps['node'] & {
    generateNextLesson?: boolean;
  };
  contextItems?: Record<string, any>[];
}

const LessonSummary: React.FC<ExtendedFlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode,
  contextItems = []
}) => {
  console.log("LessonSummary props:", { node, contextItems });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken, user } = useAuth();
  
  // Find current score and other data from context
  const currentScore = contextItems?.find(item => item.key === 'currentScore')?.value || 0;
  const totalQuestions = contextItems?.filter(item => 
    item.key.startsWith('answer') && !item.key.includes('correct')
  ).length || 3;
  
  // Replace variables in the message
  const processMessage = (message: string): string => {
    return message
      .replace(/\{\{score\}\}/g, currentScore.toString())
      .replace(/\{\{totalQuestions\}\}/g, totalQuestions.toString());
  };
  
  const generateNextLessonContent = async () => {
    if (!node.generateNextLesson) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      // Get auth token
      const token = await getToken();
      
      if (!token || !user) {
        throw new Error('Brak autoryzacji. Zaloguj się ponownie.');
      }
      
      // Collect context data for LLM
      const previousAnswers = contextItems
        .filter(item => item.key.startsWith('answer'))
        .map(item => ({
          question: item.sourceNode?.assistantMessage || 'Unknown question',
          answer: item.value.answer || item.value,
          correct: item.value.correct
        }));
      
      // Create a prompt for the LLM
      const systemMessage = `
        Jesteś pomocnym asystentem, który generuje nową lekcję języka angielskiego na podstawie wyników poprzedniej lekcji.
        Analizuj poprzednie odpowiedzi użytkownika i dostosuj poziom trudności.
        Twoim zadaniem jest wygenerowanie nowej lekcji w formacie JSON zawierającej 3 pytania.
      `;
      
      const userMessage = `
        Wygeneruj nową lekcję językową na podstawie tych informacji:
        - Aktualny wynik: ${currentScore}/${totalQuestions}
        - Poprzednie odpowiedzi: ${JSON.stringify(previousAnswers)}
        
        Odpowiedz w formacie JSON zgodnym z tą strukturą:
        {
          "lessonName": "Nazwa lekcji",
          "lessonDescription": "Krótki opis lekcji",
          "difficulty": "beginner|intermediate|advanced",
          "questions": [
            {
              "type": "quiz|text",
              "question": "Treść pytania",
              "options": ["Opcja A", "Opcja B", "Opcja C", "Opcja D"], // tylko dla typu quiz
              "correctAnswer": "Poprawna odpowiedź",
              "acceptableAnswers": ["wariant1", "wariant2"], // opcjonalne, tylko dla typu text
              "explanation": "Wyjaśnienie odpowiedzi"
            },
            // więcej pytań...
          ]
        }
      `;
      
      // Przygotuj wiadomości
      const messages = [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ];
      
      // Format danych według wymaganej struktury
      const payload = {
        messages: messages,
        userId: user.uid
      };
      
      // Wysyłanie żądania do LLM API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Żądanie API zakończone błędem: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Parse the generated lesson from JSON response
      let generatedLesson;
      try {
        // Find JSON in the response text
        const jsonMatch = responseData.content.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : responseData.content;
        generatedLesson = JSON.parse(jsonString);
      } catch (e) {
        throw new Error('Nie udało się przetworzyć odpowiedzi LLM');
      }
      
      // Return the generated lesson
      onSubmit(JSON.stringify({
        completed: true,
        score: currentScore,
        totalQuestions: totalQuestions,
        generatedLesson: generatedLesson
      }));
      
    } catch (err) {
      console.error('Błąd podczas generowania lekcji:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Calculate score percentage
  const scorePercentage = Math.round((currentScore / totalQuestions) * 100);
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-center mb-8">
          {scorePercentage >= 70 ? (
            <div className="rounded-full bg-green-100 p-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : scorePercentage >= 40 ? (
            <div className="rounded-full bg-yellow-100 p-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : (
            <div className="rounded-full bg-red-100 p-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Lekcja ukończona!
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          {processMessage(node.assistantMessage || `Uzyskałeś wynik: ${currentScore}/${totalQuestions} punktów.`)}
        </p>
        
        {/* Score visualization */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Twój wynik</span>
            <span className="text-sm font-medium text-gray-700">{scorePercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${
                scorePercentage >= 70 ? 'bg-green-500' : 
                scorePercentage >= 40 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`} 
              style={{ width: `${scorePercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Status message */}
        <div className={`p-4 rounded-lg mb-6 ${
          scorePercentage >= 70 ? 'bg-green-100 text-green-800' : 
          scorePercentage >= 40 ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-start">
            <div className="ml-3">
              <h3 className="text-sm font-medium">
                {scorePercentage >= 70 
                  ? 'Doskonale! Lekcja zaliczona.' 
                  : scorePercentage >= 40 
                    ? 'Nieźle! Możesz spróbować ponownie, aby poprawić wynik.' 
                    : 'Spróbuj jeszcze raz, aby lepiej opanować materiał.'}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-6">
            {error}
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
          
          {node.generateNextLesson ? (
            <button
              onClick={generateNextLessonContent}
              disabled={isGenerating}
              className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${
                isGenerating
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generowanie następnej lekcji...
                </div>
              ) : (
                'Wygeneruj następną lekcję'
              )}
            </button>
          ) : (
            <button
              onClick={() => onSubmit(JSON.stringify({ completed: true, score: currentScore, totalQuestions: totalQuestions }))}
              className="px-6 py-2 rounded-lg text-white font-semibold bg-green-500 hover:bg-green-600 transition-colors"
            >
              {isLastNode ? 'Zakończ' : 'Kontynuuj'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonSummary;