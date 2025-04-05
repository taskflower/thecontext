/**
 * E-Learning Assistant Message Component
 */
import React from 'react';
import { AssistantMessageProps } from '../../types';
import ReactMarkdown from 'react-markdown';

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg border border-blue-100 shadow-sm p-6 mb-6 ${className}`}>
      <div className="flex items-center mb-4 pb-4 border-b border-blue-50">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-gray-800">Instructor</div>
          <div className="text-xs text-gray-500">Learning Guide</div>
        </div>
      </div>
      
      <div className="prose prose-blue max-w-none">
        {typeof ReactMarkdown !== 'undefined' ? (
          <ReactMarkdown>{message}</ReactMarkdown>
        ) : (
          <div dangerouslySetInnerHTML={{ 
            __html: message
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br />')
              .replace(/- (.*?)(?:\n|$)/g, '<li>$1</li>')
              .replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>')
              .replace(/<\/ul><ul>/g, '')
          }} />
        )}
      </div>
    </div>
  );
};

export default AssistantMessage;