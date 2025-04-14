// src/templates/education/flowSteps/LessonDisplayTemplate.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { useAppStore } from '@/lib/store';

const LessonDisplayTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  const [activeSection, setActiveSection] = useState('wprowadzenie');
  const processTemplate = useAppStore(state => state.processTemplate);
  const getContextPath = useAppStore(state => state.getContextPath);

  // Pobierz wygenerowaną zawartość lekcji
  const lessonContent = getContextPath('generatedContent') || {};
  
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

  // Funkcja renderująca zawartość aktywnej sekcji
  const renderActiveContent = () => {
    switch(activeSection) {
      case 'cele':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Cele nauczania</h3>
            {Array.isArray(lessonContent.cele_nauczania) ? (
              <ul className="list-disc pl-5 space-y-1">
                {lessonContent.cele_nauczania.map((cel, index) => (
                  <li key={index}>{cel}</li>
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
            <p className="whitespace-pre-line">{lessonContent.wprowadzenie}</p>
          </div>
        );
      case 'pojecia':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Kluczowe pojęcia</h3>
            {Array.isArray(lessonContent.kluczowe_pojecia) ? (
              <div className="space-y-2">
                {lessonContent.kluczowe_pojecia.map((pojecie, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-lg">
                    {typeof pojecie === 'string' ? (
                      pojecie
                    ) : pojecie && typeof pojecie === 'object' && 'nazwa' in pojecie && 'definicja' in pojecie ? (
                      <>
                        <div className="font-medium">{pojecie.nazwa}</div>
                        <div>{pojecie.definicja}</div>
                      </>
                    ) : (
                      JSON.stringify(pojecie)
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
            <div className="whitespace-pre-line">{lessonContent.tresc_glowna}</div>
          </div>
        );
      case 'przyklady':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Przykłady</h3>
            {Array.isArray(lessonContent.przyklady) ? (
              <div className="space-y-3">
                {lessonContent.przyklady.map((przyklad, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                    <p className="font-medium">Przykład {index + 1}</p>
                    <p>{przyklad}</p>
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
                {lessonContent.interaktywne_cwiczenia.map((cwiczenie, index) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                    <p className="font-medium">Ćwiczenie {index + 1}</p>
                    <p>{cwiczenie}</p>
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
            <p className="whitespace-pre-line">{lessonContent.podsumowanie}</p>
          </div>
        );
      default:
        return <p>Wybierz sekcję z menu.</p>;
    }
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
        
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isLastNode ? 'Zakończ' : 'Kontynuuj'}
        </button>
      </div>
    </div>
  );
};

export default LessonDisplayTemplate;