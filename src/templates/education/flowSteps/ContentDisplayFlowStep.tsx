// src/templates/education/flowSteps/ContentDisplayFlowStep.tsx
import React, { useState } from 'react';
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
  // Extract content type and data paths from node attributes
  const contentType = node.attrs?.contentType || 'lesson'; // 'lesson' or 'project'
  const contentPath = node.attrs?.contentPath || 'generatedContent';
  const contextPath = node.attrs?.contextPath || 'learningSession';
  const additionalContextPath = node.attrs?.additionalContextPath;
  
  // Get store functions
  const processTemplate = useAppStore(state => state.processTemplate);
  const getContextPath = useAppStore(state => state.getContextPath);
  const { saveItem } = useIndexedDB();
  
  // Get content and context data
  const content = getContextPath(contentPath) || {};
  const context = getContextPath(contextPath) || {};
  const additionalContext = additionalContextPath 
    ? getContextPath(additionalContextPath) || {}
    : {};
  
  // Get configuration for the current content type
  const tabs = tabConfigs[contentType] || tabConfigs.lesson;
  const fields = contentFields[contentType] || contentFields.lesson;
  const ui = uiSettings[contentType] || uiSettings.lesson;
  
  // Component state
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Process the assistant message
  const processedMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';

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
      } else if (ui.saveType === 'project' && projectWork) {
        itemToSave.content.projectWork = projectWork;
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
    if (!fieldKey) return <p>Tab content not configured.</p>;
    
    const tabContent = content[fieldKey];
    
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

  return (
    <div className="space-y-4">
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
        {contentType === 'project' && additionalContext && (
          <div className="flex space-x-3 mt-2 text-sm">
            <div className="bg-white/20 px-2 py-1 rounded-full">
              <SafeContent content={additionalContext.projectType || 'Projekt'} />
            </div>
            <div className="bg-white/20 px-2 py-1 rounded-full">
              <SafeContent content={`${additionalContext.deadlineWeeks || 2} tygodnie`} />
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