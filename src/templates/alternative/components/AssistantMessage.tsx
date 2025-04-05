/**
 * Alternative Assistant Message Component
 */
import React from 'react';
import { AssistantMessageProps } from '../../types';
import ReactMarkdown from 'react-markdown';

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  className = ''
}) => {
  return (
    <div className={`p-5 bg-white mb-5 ${className}`}>
      <div className="flex items-start mb-3">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="font-medium text-gray-700">Assistant</div>
      </div>
      
      <div className="pl-12 prose prose-indigo max-w-none">
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