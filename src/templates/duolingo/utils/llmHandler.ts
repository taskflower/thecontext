// src/templates/duolingo/utils/llmHandler.ts
import { useAuth } from '@/hooks/useAuth';

// Schemat dla pojedynczego pytania
export interface LearningQuestion {
  type: 'quiz' | 'text';
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  explanation: string;
}

// Schemat dla całej lekcji
export interface GeneratedLesson {
  lessonName: string;
  lessonDescription: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: LearningQuestion[];
}

// Schemat dla danych użytkownika
export interface UserLearningData {
  language: string;
  level: number;
  completedLessons: string[];
  recentScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
}

// Funkcja do generowania nowej lekcji na podstawie postępu użytkownika
export async function generateLessonContent(
  userData: UserLearningData,
  previousAnswers: Array<{ question: string; answer: string; correct: boolean }>,
  completionRate: number
): Promise<GeneratedLesson | null> {
  const { getToken, user } = useAuth();
  
  try {
    // Zdobądź token autoryzacyjny
    const token = await getToken();
    
    if (!token || !user) {
      throw new Error('Brak autoryzacji. Zaloguj się ponownie.');
    }
    
    // Schemat przeznaczony dla LLM - precyzyjnie definiuje oczekiwaną strukturę odpowiedzi
    const jsonSchema = {
      type: "object",
      properties: {
        lessonName: {
          type: "string",
          description: "Nazwa lekcji, krótka i treściwa"
        },
        lessonDescription: {
          type: "string",
          description: "Krótki opis o czym jest ta lekcja"
        },
        difficulty: {
          type: "string",
          enum: ["beginner", "intermediate", "advanced"],
          description: "Poziom trudności lekcji"
        },
        questions: {
          type: "array",
          description: "Lista pytań w ramach lekcji",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["quiz", "text"],
                description: "Rodzaj pytania - quiz (wybór) lub text (wpisywanie)"
              },
              question: {
                type: "string",
                description: "Treść pytania"
              },
              options: {
                type: "array",
                description: "Lista opcji do wyboru (tylko dla typu quiz)",
                items: {
                  type: "string"
                }
              },
              correctAnswer: {
                type: "string",
                description: "Poprawna odpowiedź"
              },
              acceptableAnswers: {
                type: "array",
                description: "Lista akceptowalnych wariantów odpowiedzi (tylko dla typu text)",
                items: {
                  type: "string"
                }
              },
              explanation: {
                type: "string",
                description: "Wyjaśnienie odpowiedzi"
              }
            },
            required: ["type", "question", "correctAnswer", "explanation"]
          }
        }
      },
      required: ["lessonName", "lessonDescription", "difficulty", "questions"]
    };
    
    // Przygotuj wiadomość systemową dla modelu LLM
    const systemMessage = `
      Jesteś ekspertem w tworzeniu spersonalizowanych lekcji językowych.
      Twoim zadaniem jest wygenerowanie nowej lekcji dostosowanej do poziomu i potrzeb użytkownika.
      
      Przeanalizuj dostarczone dane o użytkowniku, jego poprzednich odpowiedziach i dostosuj poziom trudności.
      
      Odpowiedź MUSI być zgodna z podanym schematem JSON. Nie dodawaj żadnych dodatkowych informacji poza 
      poprawnie sformatowanym JSON-em.
      
      Schemat JSON: ${JSON.stringify(jsonSchema, null, 2)}
      
      WAŻNE ZASADY:
      1. Jeśli typ pytania to "quiz", musisz dostarczyć tablicę "options" z 3-4 opcjami.
      2. Jeśli typ pytania to "text", powinieneś dostarczyć tablicę "acceptableAnswers" z różnymi możliwymi odpowiedziami.
      3. Dostosuj trudność w oparciu o wcześniejsze odpowiedzi - jeśli użytkownik miał wysoką skuteczność, zwiększ trudność.
      4. Uwzględnij mocne i słabe strony użytkownika przy tworzeniu pytań.
      5. Każde pytanie musi zawierać wyjaśnienie, dlaczego odpowiedź jest poprawna.
      6. Zawsze uwzględniaj aktualny poziom języka użytkownika.
    `;
    
    // Przygotuj wiadomość z danymi użytkownika
    const userMessage = `
      Dane użytkownika:
      - Język: ${userData.language}
      - Poziom: ${userData.level}
      - Ukończone lekcje: ${userData.completedLessons.join(', ')}
      - Ostatnie wyniki: ${JSON.stringify(userData.recentScores)}
      - Mocne strony: ${userData.strengths.join(', ')}
      - Słabe strony: ${userData.weaknesses.join(', ')}
      
      Ostatnie odpowiedzi:
      ${JSON.stringify(previousAnswers, null, 2)}
      
      Procent ukończenia poprzedniej lekcji: ${completionRate}%
      
      Wygeneruj nową lekcję dostosowaną do tego użytkownika.
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
    let generatedLesson: GeneratedLesson;
    try {
      // Find JSON in the response text
      const jsonMatch = responseData.content.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : responseData.content;
      generatedLesson = JSON.parse(jsonString);
      
      // Walidacja czy odpowiedź jest zgodna ze schematem
      validateGeneratedLesson(generatedLesson);
      
      return generatedLesson;
    } catch (e) {
      console.error('Error parsing LLM response:', e);
      throw new Error('Nie udało się przetworzyć odpowiedzi LLM');
    }
  } catch (err) {
    console.error('Error generating lesson:', err);
    return null;
  }
}

// Funkcja pomocnicza do walidacji wygenerowanej lekcji
function validateGeneratedLesson(lesson: GeneratedLesson): void {
  // Podstawowa walidacja struktury
  if (!lesson.lessonName || !lesson.lessonDescription || !lesson.difficulty || !Array.isArray(lesson.questions)) {
    throw new Error('Wygenerowana lekcja nie zawiera wymaganych pól');
  }
  
  // Sprawdzanie każdego pytania
  lesson.questions.forEach((question, index) => {
    if (!question.type || !question.question || !question.correctAnswer || !question.explanation) {
      throw new Error(`Pytanie ${index + 1} nie zawiera wymaganych pól`);
    }
    
    // Sprawdzanie pól specyficznych dla typu pytania
    if (question.type === 'quiz' && (!Array.isArray(question.options) || question.options.length < 2)) {
      throw new Error(`Pytanie typu quiz ${index + 1} nie zawiera wystarczającej liczby opcji`);
    }
  });
}

// Funkcja do konwersji lekcji wygenerowanej przez LLM na scenariusz (Scenario)
export function convertLessonToScenario(
  generatedLesson: GeneratedLesson,
  userId: string
): {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  systemMessage: string;
  lessonData: {
    level: number;
    category: string;
    language: string;
    requiredScore: number;
  };
} {
  // Tworzenie unikalnego ID dla scenariusza
  const scenarioId = `duo-scenario-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Tworzenie węzłów na podstawie pytań
  const nodes = generatedLesson.questions.map((question, index) => {
    const nodeId = `${scenarioId}-node-${index + 1}`;
    
    // Mapowanie bazowe dla wszystkich typów pytań
    const baseNode = {
      id: nodeId,
      scenarioId: scenarioId,
      label: `Pytanie ${index + 1}`,
      assistantMessage: question.question,
      contextKey: `answer${index + 1}`,
      explanation: question.explanation,
      correctAnswer: question.correctAnswer
    };
    
    // Dostosowanie do typu pytania
    if (question.type === 'quiz') {
      return {
        ...baseNode,
        templateId: 'duo-quiz',
        quizOptions: question.options
      };
    } else { // text input
      return {
        ...baseNode,
        templateId: 'duo-text-input',
        acceptableAnswers: question.acceptableAnswers || [question.correctAnswer]
      };
    }
  });
  
  // Dodanie węzła podsumowania
  const summaryNode = {
    id: `${scenarioId}-summary`,
    scenarioId: scenarioId,
    label: 'Podsumowanie',
    assistantMessage: 'Gratulacje! Ukończyłeś/aś lekcję. Twój wynik to: {{score}}/{{totalQuestions}} punkty.',
    contextKey: 'lessonComplete',
    templateId: 'duo-summary',
    generateNextLesson: true
  };
  
  nodes.push(summaryNode);
  
  // Określenie poziomu trudności jako wartość liczbową
  const difficultyLevel = 
    generatedLesson.difficulty === 'beginner' ? 1 :
    generatedLesson.difficulty === 'intermediate' ? 2 : 3;
  
  // Określenie wymaganego wyniku w zależności od trudności
  const requiredScore = Math.max(1, Math.floor(generatedLesson.questions.length * 0.6));
  
  // Określenie kategorii na podstawie opisu lekcji
  const lessonDescriptionLower = generatedLesson.lessonDescription.toLowerCase();
  let category = 'misc';
  
  if (lessonDescriptionLower.includes('podstaw') || lessonDescriptionLower.includes('basic')) {
    category = 'basics';
  } else if (lessonDescriptionLower.includes('jedzenie') || lessonDescriptionLower.includes('food')) {
    category = 'food';
  } else if (lessonDescriptionLower.includes('podróż') || lessonDescriptionLower.includes('travel')) {
    category = 'travel';
  } else if (lessonDescriptionLower.includes('biznes') || lessonDescriptionLower.includes('business')) {
    category = 'business';
  }
  
  // Tworzenie wiadomości systemowej
  // Tworzenie wiadomości systemowej
  const systemMessage = `
    Jesteś pomocnym nauczycielem języka, który pomaga uczniom w nauce.
    Twój styl jest przyjazny, zachęcający i zawsze pozytywny.
    Udzielaj jasnych wyjaśnień i motywuj ucznia do dalszej nauki.
    Twój język jest dostosowany do poziomu ${generatedLesson.difficulty}.
  `;
  
  // Zwracamy kompletny scenariusz
  return {
    id: scenarioId,
    name: generatedLesson.lessonName,
    description: generatedLesson.lessonDescription,
    nodes: nodes,
    systemMessage: systemMessage,
    lessonData: {
      level: difficultyLevel,
      category: category,
      language: 'english', // Można dostosować w zależności od potrzeb
      requiredScore: requiredScore
    }
  };
}

// Funkcja do tworzenia nowego scenariusza i dodawania go do workspace'u
export async function createAndAddGeneratedLesson(
  workspaceId: string,
  generatedLesson: GeneratedLesson,
  userId: string,
  addScenarioToWorkspace: (workspaceId: string, scenario: any) => Promise<boolean>
): Promise<boolean> {
  try {
    // Konwersja lekcji na scenariusz
    const newScenario = convertLessonToScenario(generatedLesson, userId);
    
    // Dodanie scenariusza do workspace'u
    return await addScenarioToWorkspace(workspaceId, newScenario);
  } catch (error) {
    console.error('Error creating new scenario:', error);
    return false;
  }
}