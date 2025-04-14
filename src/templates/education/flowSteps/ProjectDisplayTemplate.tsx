// src/templates/education/flowSteps/ProjectDisplayTemplate.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { useAppStore } from '@/lib/store';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import SafeContent from '../resources/SafeContent';


const ProjectDisplayTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  const [activeTab, setActiveTab] = useState('opis');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const processTemplate = useAppStore(state => state.processTemplate);
  const getContextPath = useAppStore(state => state.getContextPath);

  // Hook do obsługi IndexedDB
  const { saveItem } = useIndexedDB();

  // Pobierz wygenerowany projekt
  const projectContent = getContextPath('generatedContent') || {};
  const projectSettings = getContextPath('projectWork') || {};
  const learningSession = getContextPath('learningSession') || {};
  
  // Przetwórz wiadomość asystenta
  const processedMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';

  const handleSubmit = () => {
    onSubmit({
      accepted: true,
      timestamp: new Date().toISOString()
    });
  };

  // Funkcja zapisująca projekt do IndexedDB
  const handleSaveProject = async () => {
    const title = projectContent.tytul_projektu;
    if (!projectContent || !title) {
      setSaveStatus('error');
      return;
    }
    
    try {
      setSaveStatus('saving');
      
      // Generuj unikalny identyfikator
      const projectType = projectSettings.projectType || 'projekt';
      const subject = learningSession.subject || 'przedmiot';
      const id = `project_${subject}_${projectType}`.replace(/\s+/g, '_').toLowerCase();
      
      await saveItem({
        id,
        type: 'project',
        title: typeof title === 'string' ? title : 'Projekt edukacyjny',
        content: {
          projectContent,
          projectSettings,
          learningSession,
          savedAt: new Date().toISOString()
        }
      });
      
      setSaveStatus('saved');
      
      // Reset statusu po 3 sekundach
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Błąd podczas zapisywania projektu:', error);
      setSaveStatus('error');
    }
  };

  // Renderuj bezpieczną listę elementów
  const renderSafeList = (items: any[], renderItem?: (item: any, index: number) => React.ReactNode) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <p className="text-gray-500 italic">Brak danych</p>;
    }
    
    return (
      <div className="space-y-2">
        {items.map((item, index) => {
          if (renderItem) {
            return renderItem(item, index);
          }
          
          return (
            <div key={index}>
              <SafeContent content={item} />
            </div>
          );
        })}
      </div>
    );
  };

  // Funkcja renderująca zawartość aktywnej zakładki
  const renderActiveTab = () => {
    switch(activeTab) {
      case 'opis':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Opis projektu</h3>
            <div className="whitespace-pre-line">
              <SafeContent content={projectContent.opis} />
            </div>
          </div>
        );
      case 'cele':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Cele edukacyjne</h3>
            {Array.isArray(projectContent.cele) ? (
              <ul className="list-disc pl-5 space-y-1">
                {projectContent.cele.map((cel, index) => (
                  <li key={index}><SafeContent content={cel} /></li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Brak zdefiniowanych celów</p>
            )}
          </div>
        );
      case 'etapy':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Etapy realizacji</h3>
            {Array.isArray(projectContent.etapy) ? (
              <div className="space-y-3">
                {projectContent.etapy.map((etap, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <SafeContent content={etap} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Brak zdefiniowanych etapów</p>
            )}
          </div>
        );
      case 'wskazowki':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Wskazówki</h3>
            {Array.isArray(projectContent.wskazowki) ? (
              <div className="space-y-2">
                {projectContent.wskazowki.map((wskazowka, index) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                    <SafeContent content={wskazowka} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Brak wskazówek</p>
            )}
          </div>
        );
      case 'ocena':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Kryteria oceny</h3>
            {Array.isArray(projectContent.kryteria_oceny) ? (
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lp.</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kryterium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projectContent.kryteria_oceny.map((kryterium, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap">{index + 1}</td>
                        <td className="px-4 py-2"><SafeContent content={kryterium} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">Brak zdefiniowanych kryteriów oceny</p>
            )}
          </div>
        );
      case 'materialy':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Materiały dodatkowe</h3>
            {Array.isArray(projectContent.materialy_dodatkowe) ? (
              <ul className="list-disc pl-5 space-y-1">
                {projectContent.materialy_dodatkowe.map((material, index) => (
                  <li key={index}><SafeContent content={material} /></li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Brak dodatkowych materiałów</p>
            )}
          </div>
        );
      default:
        return <p>Wybierz zakładkę.</p>;
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
          return 'Zapisz projekt';
      }
    };

    return (
      <button
        onClick={handleSaveProject}
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
      
      {/* Nagłówek projektu */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-lg text-white">
        <h2 className="text-xl font-bold">
          <SafeContent content={projectContent.tytul_projektu || 'Projekt edukacyjny'} />
        </h2>
        <div className="flex space-x-3 mt-2 text-sm">
          <div className="bg-white/20 px-2 py-1 rounded-full">
            <SafeContent content={projectSettings.projectType || 'Projekt'} />
          </div>
          <div className="bg-white/20 px-2 py-1 rounded-full">
            <SafeContent content={`${projectSettings.deadlineWeeks || 2} tygodnie`} />
          </div>
        </div>
      </div>
      
      {/* Zakładki projektu */}
      <div className="flex space-x-1 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('opis')}
          className={`px-4 py-2 ${activeTab === 'opis' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
        >
          Opis
        </button>
        <button
          onClick={() => setActiveTab('cele')}
          className={`px-4 py-2 ${activeTab === 'cele' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
        >
          Cele
        </button>
        <button
          onClick={() => setActiveTab('etapy')}
          className={`px-4 py-2 ${activeTab === 'etapy' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
        >
          Etapy
        </button>
        <button
          onClick={() => setActiveTab('wskazowki')}
          className={`px-4 py-2 ${activeTab === 'wskazowki' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
        >
          Wskazówki
        </button>
        <button
          onClick={() => setActiveTab('ocena')}
          className={`px-4 py-2 ${activeTab === 'ocena' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
        >
          Ocena
        </button>
        <button
          onClick={() => setActiveTab('materialy')}
          className={`px-4 py-2 ${activeTab === 'materialy' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
        >
          Materiały
        </button>
      </div>
      
      {/* Zawartość projektu */}
      <div className="p-4 bg-white rounded-lg shadow border">
        {renderActiveTab()}
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

export default ProjectDisplayTemplate;