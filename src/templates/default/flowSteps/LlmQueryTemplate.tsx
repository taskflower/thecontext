// src/templates/flowSteps/LlmQueryTemplate.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { NodeData, Scenario } from '@/../raw_modules/revertcontext-nodes-module/src';
import { useAppStore } from '@/lib/store';
import { useChat } from '@/hooks/useChat';
import { MessageSquare, Shield, User, Info } from 'lucide-react';

// Rozszerzony interfejs dla FlowStepProps, który uwzględnia scenario i rozszerzony node
interface ExtendedFlowStepProps extends Omit<FlowStepProps, 'node'> {
  node: NodeData;
  scenario?: Scenario;
  contextItems?: ContextItem[];
}

interface ContextItem {
  id: string;
  title?: string;
  contentType?: string;
  content: any;
  updatedAt?: any;
}

interface InfoBadgeProps {
  type: 'assistant' | 'system' | 'user' | 'debug';
  title: string;
  content: string;
  className?: string;
}

const InfoBadge: React.FC<InfoBadgeProps> = ({ type, title, content, className = '' }) => {
  const styles = {
    assistant: {
      container: 'bg-blue-50 border-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      titleColor: 'text-lg font-semibold mb-2',
      textColor: 'text-gray-700',
      icon: <MessageSquare size={20} />
    },
    system: {
      container: 'bg-amber-50 border-amber-100',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
      titleColor: 'text-sm font-medium text-amber-800 mb-1',
      textColor: 'text-xs text-amber-700',
      icon: <Shield size={20} />
    },
    user: {
      container: 'bg-green-50 border-green-100',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500',
      titleColor: 'text-sm font-medium text-green-800 mb-1',
      textColor: 'text-xs text-green-700',
      icon: <User size={20} />
    },
    debug: {
      container: 'bg-gray-100 border-gray-200',
      iconBg: 'bg-gray-200',
      iconColor: 'text-gray-500',
      titleColor: 'text-sm font-medium text-gray-800 mb-1',
      textColor: 'text-xs text-gray-800',
      icon: <Info size={20} />
    }
  };

  const style = styles[type];
  
  return (
    <div className={`p-3 rounded-lg border ${style.container} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${style.iconBg}`}>
          <div className={style.iconColor}>{style.icon}</div>
        </div>
        <div>
          <h3 className={style.titleColor}>{title}</h3>
          <p className={style.textColor}>{content}</p>
        </div>
      </div>
    </div>
  );
};

const LlmQueryTemplate: React.FC<ExtendedFlowStepProps> = ({ 
  node, 
  scenario,
  onSubmit, 
  onPrevious, 
  isLastNode,
}) => {
  const [userInput, setUserInput] = useState('');
  const processTemplate = useAppStore(state => state.processTemplate);
  
  // Przetwarzamy wiadomość asystenta używając funkcji z AppStore
  const processedAssistantMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : 'W czym mogę pomóc?';
  
  // Używamy nowego hooka
  const { 
    sendMessage, 
    isLoading, 
    error, 
    debugInfo 
  } = useChat({
    includeSystemMessage: node.includeSystemMessage || false,
    systemMessage: scenario?.systemMessage || '',
    initialUserMessage: node.initialUserMessage || '',
    assistantMessage: node.assistantMessage || '',
    contextPath: node.contextPath || '',
    onDataSaved: (data) => {
      if (node.contextKey) {
        onSubmit(data);
      } else {
        onSubmit(data);
      }
      setUserInput('');
    }
  });

  const handleSubmit = () => {
    if (userInput.trim() === '') return;
    sendMessage(userInput);
  };

  return (
    <div className="space-y-4">
      <InfoBadge 
        type="assistant"
        title="Asystent AI"
        content={processedAssistantMessage}
        className="p-4"
      />

      {node.includeSystemMessage && scenario?.systemMessage && (
        <InfoBadge 
          type="system"
          title="System Message"
          content={scenario.systemMessage}
        />
      )}

      {node.initialUserMessage && (
        <InfoBadge 
          type="user"
          title="Initial User Message"
          content={node.initialUserMessage}
        />
      )}

      {debugInfo && (
        <InfoBadge 
          type="debug"
          title="Debug"
          content={debugInfo}
        />
      )}

      <div className="space-y-2">
        <textarea 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Zapytaj asystenta AI..."
        />

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            Błąd: {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button 
            onClick={onPrevious}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Wstecz
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading || userInput.trim() === ''}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center space-x-2 disabled:bg-blue-300"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Przetwarzanie...</span>
              </>
            ) : (
              <span>{isLastNode ? 'Zakończ' : 'Wyślij i Kontynuuj'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LlmQueryTemplate;