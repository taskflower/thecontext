// src/templates/education/flowSteps/ContentDisplayFlowStep.tsx
import React, { useState, useEffect } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { useAppStore } from '@/lib/store';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import SafeContent from '../resources/SafeContent';
import { 
  tabConfigs, 
  contentFields, 
  uiSettings, 
  getItemBackground 
} from '../resources/ContentMappings';

const ContentDisplayFlowStep: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  // Get store functions
  const processTemplate = useAppStore(state => state.processTemplate);
  const getContextPath = useAppStore(state => state.getContextPath);
  const { saveItem } = useIndexedDB();
  
  // Extract content type and data paths from node attributes
  let contentType = node.attrs?.contentType || 'lesson'; // 'lesson' or 'project'
  
  // Konwersja wartości z handlebarów, które mogą przychodzić jako string 
  // z template markupem, np. "{{savedItems.selectedItem.type}}"
  if (typeof contentType === 'string' && contentType.includes('{{')) {
    console.log('ContentType contains handlebars, processing:', contentType);
    contentType = processTemplate(contentType) || 'lesson';
    console.log('After processing:', contentType);
  }
  
  // Dodatkowo sprawdź na podstawie wyselekcjonowanego elementu
  const selectedItem = getContextPath('savedItems.selectedItem');
  if (selectedItem && selectedItem.type) {
    contentType = selectedItem.type;
    console.log('ContentType from selectedItem:', contentType);
  }
  
  // Logowanie dla diagnostyki
  console.log('Using contentType:', contentType);
  
  const contentPath = node.attrs?.contentPath || 'generatedContent';
  const contextPath = node.attrs?.contextPath || 'learningSession';
  const additionalContextPath = node.attrs?.additionalContextPath;
  
  // Helper function to normalize content data
  const normalizeContent = (rawContent: any, type: string) => {
    if (!rawContent) return {};
    
    const normalized = {...rawContent};
    
    // Dla projektów sprawdź czy klucze są w poprawnym formacie
    if (type === 'project') {
      // Mapuj różne możliwe klucze na standardowe klucze projektu
      const keyMappings: Record<string, string> = {
        // Tytuł
        'tytul': 'tytul_projektu',
        'tytuł': 'tytul_projektu',
        'title': 'tytul_projektu',
        
        // Opis
        'opis_projektu': 'opis',
        'description': 'opis',
        
        // Cele
        'cele_nauczania': 'cele',
        'cele_projektu': 'cele',
        'goals': 'cele',
        
        // Etapy
        'etapy_realizacji': 'etapy',
        'phases': 'etapy',
        'steps': 'etapy',
        
        // Wskazówki
        'tips': 'wskazowki',
        
        // Kryteria oceny
        'kryteria': 'kryteria_oceny',
        'evaluation': 'kryteria_oceny',
        
        // Materiały
        'materialy': 'materialy_dodatkowe',
        'resources': 'materialy_dodatkowe'
      };
      
      // Przepisz klucze jeśli istnieją
      Object.entries(keyMappings).forEach(([source, target]) => {
        if (normalized[source] !== undefined && normalized[target] === undefined) {
          console.log(`Mapping project key from ${source} to ${target}`);
          normalized[target] = normalized[source];
        }
      });
      
      // Sprawdź czy mamy podstawowe klucze
      if (!normalized.tytul_projektu && normalized.tytul) {
        normalized.tytul_projektu = normalized.tytul;
      }
    }
    
    return normalized;
  };
  
  // Get content and context data
  const rawContent = getContextPath(contentPath) || {};
  const content = normalizeContent(rawContent, contentType);
  const context = getContextPath(contextPath) || {};
  const additionalContext = additionalContextPath 
    ? getContextPath(additionalContextPath) || {}
    : {};
  
  // Get configuration for the current content type
  const tabs = tabConfigs[contentType] || tabConfigs.lesson;
  const fields = contentFields[contentType] || contentFields.lesson;
  const ui = uiSettings[contentType] || uiSettings.lesson;
  
  // Dodatkowe logowanie
  console.log('Content configuration:', {
    contentType,
    tabs,
    tabsFromConfig: tabConfigs[contentType],
    fields,
    fieldsFromConfig: contentFields[contentType],
    ui,
    uiFromConfig: uiSettings[contentType]
  });
  
  // Component state
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Effect to update active tab when content type changes
  useEffect(() => {
    // Upewnij się, że activeTab jest zgodny z dostępnymi zakładkami dla danego typu
    if (tabs.length > 0 && !tabs.some(tab => tab.id === activeTab)) {
      console.log(`Active tab ${activeTab} not found in tabs for ${contentType}, resetting to ${tabs[0]?.id}`);
      setActiveTab(tabs[0]?.id || '');
    }
  }, [contentType, tabs, activeTab]);
  
  // Process the assistant message
  const processedMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';
    
  // Debug data - wyświetl w konsoli dane potrzebne do debugowania
  if (contentType === 'project') {
    console.log('ContentDisplayFlowStep - Project data:', {
      contentType,
      content,
      context,
      additionalContext,
      projectWork: getContextPath('projectWork')
    });
  }

  // Handle completion
  const handleSubmit = () => {
    onSubmit({
      completed: true,
      timestamp: new Date().toISOString()
    });
  };

  // Handle saving content
  const handleSaveContent = async () => {
    const title = content[fields.title];
    if (!content || !title) {
      setSaveStatus('error');
      return;
    }
    
    try {
      setSaveStatus('saving');
      
      // Generate ID based on context
      const id = `${ui.idPrefix}_${context.subject || ''}_${context.topic || ''}`
        .replace(/\s+/g, '_')
        .toLowerCase();
      
      // Przygotowanie danych do zapisania
      const itemToSave = {
        id,
        type: ui.saveType,
        title: String(title || 'Content'),
        content: {
          content,
          context,
          additionalContext,
          savedAt: new Date().toISOString()
        }
      };
      
      // Dodanie specyficznych danych dla różnych typów zawartości
      const quizContent = getContextPath('quizContent');
      const projectWork = getContextPath('projectWork');
      
      if (ui.saveType === 'quiz' && quizContent) {
        itemToSave.content.quizContent = quizContent;
      } else if (ui.saveType === 'project') {
        // Dla projektów, zawsze zapisuj dane projektWork niezależnie czy istnieją
        // Synchronizuj z additionalContext w razie potrzeby
        const projectWorkData = projectWork || {};
        
        // Jeśli nie mamy danych w projectWork, ale mamy w additionalContext, użyj ich
        if (additionalContext) {
          if (!projectWorkData.projectType && additionalContext.projectType) {
            projectWorkData.projectType = additionalContext.projectType;
          }
          if (!projectWorkData.deadlineWeeks && additionalContext.deadlineWeeks) {
            projectWorkData.deadlineWeeks = additionalContext.deadlineWeeks;
          }
        }
        
        // Upewnij się, że mamy podstawowe wartości
        if (!projectWorkData.projectType) {
          projectWorkData.projectType = 'Projekt';
        }
        if (!projectWorkData.deadlineWeeks) {
          projectWorkData.deadlineWeeks = 2;
        }
        
        // Zapisz do itemToSave
        itemToSave.content.projectWork = projectWorkData;
        
        // Synchronizuj także z additionalContext dla kompatybilności wstecznej
        itemToSave.content.additionalContext = {
          ...additionalContext,
          projectType: projectWorkData.projectType,
          deadlineWeeks: projectWorkData.deadlineWeeks
        };
        
        console.log('Saving project with data:', projectWorkData);
      }
      
      await saveItem(itemToSave);
      
      setSaveStatus('saved');
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('error');
    }
  };

  // Render tab content
  const renderTabContent = () => {
    const fieldKey = fields.tabs[activeTab as keyof typeof fields.tabs];
    if (!fieldKey) {
      console.error(`Tab ${activeTab} not found in fields.tabs:`, fields.tabs);
      return <p>Tab content not configured.</p>;
    }
    
    const tabContent = content[fieldKey];
    console.log(`Rendering tab ${activeTab} with fieldKey ${fieldKey}, content:`, tabContent);
    
    // Handle different content based on tab and content type
    switch (activeTab) {
      case 'cele':
      case 'pojecia':
      case 'przyklady':
      case 'cwiczenia':
      case 'etapy':
      case 'wskazowki':
      case 'materialy':
        // List-type content
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{tabs.find(t => t.id === activeTab)?.label}</h3>
            {Array.isArray(tabContent) ? (
              <div className="space-y-2">
                {tabContent.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${getItemBackground(activeTab)}`}>
                    <SafeContent content={item} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Brak danych</p>
            )}
          </div>
        );
      
      case 'ocena':
        // Table-type content for criteria
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Kryteria oceny</h3>
            {Array.isArray(tabContent) ? (
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lp.</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kryterium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tabContent.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 whitespace-nowrap">{idx + 1}</td>
                        <td className="px-4 py-2"><SafeContent content={item} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">Brak kryteriów oceny</p>
            )}
          </div>
        );
        
      default:
        // Text content (wprowadzenie, opis, tresc, podsumowanie)
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{tabs.find(t => t.id === activeTab)?.label}</h3>
            <div className="whitespace-pre-line">
              <SafeContent content={tabContent} />
            </div>
          </div>
        );
    }
  };

  // Render save button with appropriate status
  const renderSaveButton = () => {
    const buttonStyle = {
      idle: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      saving: 'bg-yellow-500 text-white',
      saved: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white'
    }[saveStatus];
    
    const buttonText = {
      idle: 'Zapisz lokalnie',
      saving: 'Zapisywanie...',
      saved: 'Zapisano!',
      error: 'Błąd zapisu'
    }[saveStatus];
    
    return (
      <button
        onClick={handleSaveContent}
        disabled={saveStatus === 'saving' || saveStatus === 'saved'}
        className={`px-4 py-2 rounded ${buttonStyle} transition-colors duration-300`}
      >
        {buttonText}
      </button>
    );
  };

  // Debug function
  const debugAllData = () => {
    console.log('======= DEBUG ALL DATA =======');
    console.log('Content Type:', contentType);
    console.log('Content:', content);
    console.log('Raw Content:', rawContent);
    console.log('Context:', context);
    console.log('Additional Context:', additionalContext);
    console.log('ProjectWork:', getContextPath('projectWork'));
    console.log('Tabs Configuration:', tabs);
    console.log('Fields Configuration:', fields);
    console.log('UI Configuration:', ui);
    console.log('Active Tab:', activeTab);
    console.log('==============================');
    
    // Pokaż wszystkie stany dla ułatwienia debugowania
    const allState = {
      context: getContextPath(),
      contentType,
      content,
      rawContent,
      additionalContext,
      projectWork: getContextPath('projectWork'),
      tabs,
      fields,
      activeTab
    };
    
    alert('Debug data printed to console. Check browser console.');
    console.table(allState);
  };
  
  return (
    <div className="space-y-4">
      {/* Debug button */}
      <div className="text-right">
        <button 
          onClick={debugAllData}
          className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
        >
          Debug
        </button>
      </div>
      
      {/* Assistant message */}
      {processedMessage && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="whitespace-pre-line">{processedMessage}</p>
        </div>
      )}
      
      {/* Content header */}
      <div className={`bg-gradient-to-r ${ui.background} p-4 rounded-lg text-white`}>
        <h2 className="text-xl font-bold">
          <SafeContent content={content[fields.title] || (contentType === 'lesson' ? 'Lekcja' : 'Projekt')} />
        </h2>
        
        {/* Additional info for projects */}
        {contentType === 'project' && (
          <div className="flex space-x-3 mt-2 text-sm">
            <div className="bg-white/20 px-2 py-1 rounded-full">
              {/* Najpierw sprawdź projectWork, potem additionalContext jako fallback */}
              <SafeContent 
                content={
                  (getContextPath('projectWork.projectType')) || 
                  (additionalContext && additionalContext.projectType) || 
                  'Projekt'
                } 
              />
            </div>
            <div className="bg-white/20 px-2 py-1 rounded-full">
              <SafeContent 
                content={`${
                  (getContextPath('projectWork.deadlineWeeks')) || 
                  (additionalContext && additionalContext.deadlineWeeks) || 
                  2
                } tygodnie`} 
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation tabs */}
      <div className="flex overflow-x-auto space-x-1 pb-2">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-lg whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content area */}
      <div className="p-4 bg-white rounded-lg shadow border">
        {renderTabContent()}
      </div>
      
      {/* Action buttons */}
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

export default ContentDisplayFlowStep;