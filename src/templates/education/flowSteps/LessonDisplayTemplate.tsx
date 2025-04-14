// src/templates/education/flowSteps/LessonDisplayTemplate.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { useAppStore } from '@/lib/store';
import { useIndexedDB, StoredItem } from '@/hooks/useIndexedDB';

// Define the payload type for onSubmit
interface SubmitPayload {
  completed?: boolean;
  timestamp?: string;
  accepted?: boolean;
  score?: {
    correct: number;
    total: number;
    percentage: number;
  };
  userAnswers?: Record<number, string>;
  completedAt?: string;
}

// Extended props type with correct onSubmit signature
interface ExtendedFlowStepProps extends Omit<FlowStepProps, 'onSubmit'> {
  onSubmit: (payload: SubmitPayload) => void;
}

// Helper function to safely render any content
const SafeContent = ({ content }: { content: any }) => {
  if (content === null || content === undefined) {
    return null;
  }
  
  if (typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean') {
    return <>{content}</>;
  }
  
  if (Array.isArray(content)) {
    return <>{content.map((item, index) => <div key={index}><SafeContent content={item} /></div>)}</>;
  }
  
  if (typeof content === 'object') {
    return <pre>{JSON.stringify(content, null, 2)}</pre>;
  }
  
  return <>{String(content)}</>;
};

const LessonDisplayTemplate: React.FC<ExtendedFlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  const [activeSection, setActiveSection] = useState('wprowadzenie');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const processTemplate = useAppStore(state => state.processTemplate);
  const getContextPath = useAppStore(state => state.getContextPath);
  
  // Hook do obsługi IndexedDB
  const { saveItem, isLoading } = useIndexedDB();

  // Pobierz wygenerowaną zawartość lekcji
  const lessonContent = getContextPath('generatedContent') || {};
  const learningSession = getContextPath('learningSession') || {};
  
  // Przetwórz wiadomość asystenta
  const processedMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';

  const handleSubmit = () => {
    onSubmit({
      completed: true,
      timestamp: new Date().toISOString()
    });
  };
  
  // Funkcja zapisująca lekcję do IndexedDB
  const handleSaveLesson = async () => {
    if (!lessonContent || !lessonContent.tytul) {
      setSaveStatus('error');
      return;
    }
    
    try {
      setSaveStatus('saving');
      
      // Generuj unikalny identyfikator na podstawie tematu i tytułu
      const id = `lesson_${learningSession.subject}_${learningSession.topic}`.replace(/\s+/g, '_').toLowerCase();
      
      await saveItem({
        id,
        type: 'lesson',
        title: lessonContent.tytul,
        content: {
          lessonContent,
          learningSession
        }
      });
      
      setSaveStatus('saved');
      
      // Reset statusu po 3 sekundach
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Błąd podczas zapisywania lekcji:', error);
      setSaveStatus('error');
    }
  };

  // Bezpieczne renderowanie listy z obsługą różnych formatów danych
  const renderSafeList = (items: any[], renderItem?: (item: any, index: number) => React.ReactNode) => {
    if (!Array.isArray(items)) {
      return <p className="text-gray-500 italic">Brak danych</p>;
    }
    
    return (
      <div className="space-y-2">
        {items.map((item, index) => {
          if (renderItem) {
            return renderItem(item, index);
          }
          
          if (typeof item === 'string') {
            return <div key={index}>{item}</div>;
          }
          
          if (item && typeof item === 'object') {
            // Handle different possible object structures
            if ('nazwa' in item && 'definicja' in item) {
              return (
                <div key={index} className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium">{item.nazwa}</div>
                  <div>{item.definicja}</div>
                </div>
              );
            }
            
            if ('przyklad' in item) {
              return <div key={index}>{item.przyklad}</div>;
            }
            
            if ('cwiczenie' in item && 'odpowiedz' in item) {
              return (
                <div key={index} className="space-y-1">
                  <div><strong>Ćwiczenie:</strong> {item.cwiczenie}</div>
                  <div><strong>Odpowiedź:</strong> {item.odpowiedz}</div>
                </div>
              );
            }
            
            // Fallback for any other object structure
            return <pre key={index}>{JSON.stringify(item, null, 2)}</pre>;
          }
          
          // Fallback for any other type
          return <div key={index}><SafeContent content={item} /></div>;
        })}
      </div>
    );
  };

  // Funkcja renderująca zawartość aktywnej sekcji
  const renderActiveContent = () => {
    switch(activeSection) {
      case 'cele':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Cele nauczania</h3>
            {Array.isArray(lessonContent.cele_nauczania) ? (
              <ul className="list-disc pl-5 space-y-1">
                {lessonContent.cele_nauczania.map((cel: any, index: number) => (
                  <li key={index}><SafeContent content={cel} /></li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Brak zdefiniowanych celów nauczania</p>
            )}
          </div>
        );
      case 'wprowadzenie':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Wprowadzenie</h3>
            <div className="whitespace-pre-line"><SafeContent content={lessonContent.wprowadzenie} /></div>
          </div>
        );
      case 'pojecia':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Kluczowe pojęcia</h3>
            {Array.isArray(lessonContent.kluczowe_pojecia) ? (
              <div className="space-y-2">
                {lessonContent.kluczowe_pojecia.map((pojecie: any, index: number) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-lg">
                    {typeof pojecie === 'string' ? (
                      pojecie
                    ) : pojecie && typeof pojecie === 'object' && 'nazwa' in pojecie && 'definicja' in pojecie ? (
                      <>
                        <div className="font-medium">{pojecie.nazwa}</div>
                        <div>{pojecie.definicja}</div>
                      </>
                    ) : (
                      <SafeContent content={pojecie} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Brak zdefiniowanych pojęć</p>
            )}
          </div>
        );
      case 'tresc':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Treść główna</h3>
            <div className="whitespace-pre-line"><SafeContent content={lessonContent.tresc_glowna} /></div>
          </div>
        );
      case 'przyklady':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Przykłady</h3>
            {Array.isArray(lessonContent.przyklady) ? (
              <div className="space-y-3">
                {lessonContent.przyklady.map((przyklad: any, index: number) => (
                  <div key={index} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                    <p className="font-medium">Przykład {index + 1}</p>
                    {typeof przyklad === 'string' ? (
                      <p>{przyklad}</p>
                    ) : przyklad && typeof przyklad === 'object' && 'przyklad' in przyklad ? (
                      <p>{przyklad.przyklad}</p>
                    ) : (
                      <SafeContent content={przyklad} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Brak przykładów</p>
            )}
          </div>
        );
      case 'cwiczenia':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Ćwiczenia</h3>
            {Array.isArray(lessonContent.interaktywne_cwiczenia) ? (
              <div className="space-y-3">
                {lessonContent.interaktywne_cwiczenia.map((cwiczenie: any, index: number) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                    <p className="font-medium">Ćwiczenie {index + 1}</p>
                    {typeof cwiczenie === 'string' ? (
                      <p>{cwiczenie}</p>
                    ) : cwiczenie && typeof cwiczenie === 'object' ? (
                      <SafeContent content={cwiczenie} />
                    ) : (
                      <p>{String(cwiczenie)}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Brak ćwiczeń</p>
            )}
          </div>
        );
      case 'podsumowanie':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Podsumowanie</h3>
            <div className="whitespace-pre-line"><SafeContent content={lessonContent.podsumowanie} /></div>
          </div>
        );
      default:
        return <p>Wybierz sekcję z menu.</p>;
    }
  };

  // Renderuj przycisk zapisu z odpowiednim statusem
  const renderSaveButton = () => {
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
          return 'Zapisz lokalnie';
      }
    };

    return (
      <button
        onClick={handleSaveLesson}
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
      
      {/* Nagłówek lekcji */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg text-white">
        <h2 className="text-xl font-bold">{lessonContent.tytul || 'Lekcja'}</h2>
      </div>
      
      {/* Menu nawigacyjne */}
      <div className="flex overflow-x-auto space-x-1 pb-2">
        <button 
          onClick={() => setActiveSection('wprowadzenie')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeSection === 'wprowadzenie' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          Wprowadzenie
        </button>
        <button 
          onClick={() => setActiveSection('cele')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeSection === 'cele' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          Cele nauczania
        </button>
        <button 
          onClick={() => setActiveSection('pojecia')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeSection === 'pojecia' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          Kluczowe pojęcia
        </button>
        <button 
          onClick={() => setActiveSection('tresc')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeSection === 'tresc' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          Treść główna
        </button>
        <button 
          onClick={() => setActiveSection('przyklady')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeSection === 'przyklady' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          Przykłady
        </button>
        <button 
          onClick={() => setActiveSection('cwiczenia')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeSection === 'cwiczenia' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          Ćwiczenia
        </button>
        <button 
          onClick={() => setActiveSection('podsumowanie')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeSection === 'podsumowanie' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          Podsumowanie
        </button>
      </div>
      
      {/* Zawartość lekcji */}
      <div className="p-4 bg-white rounded-lg shadow border">
        {renderActiveContent()}
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
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isLastNode ? 'Zakończ' : 'Kontynuuj'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonDisplayTemplate;