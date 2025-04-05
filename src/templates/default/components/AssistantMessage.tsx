/**
 * Default Assistant Message Component
 */
import React from 'react';
import { AssistantMessageProps } from '../../types';
import ReactMarkdown from 'react-markdown';

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  className = ''
}) => {
  // Simple markdown rendering - in a real app you'd use a proper markdown renderer with more features
  return (
    <div className={`p-4 bg-white border border-gray-100 rounded-lg mb-4 ${className}`}>
      <div className="prose max-w-none">
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>
    </div>
  );
};

// For demo purposes, using a simple mock component
// In a real app, you would use ReactMarkdown or a similar library
const MockReactMarkdown: React.FC<{children: string}> = ({ children }) => {
  // Very simple markdown-like rendering for demonstration
  const formatText = (text: string) => {
    // Replace ** with strong tags
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace newlines with line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    
    // Replace unordered list items
    formatted = formatted.replace(/- (.*?)(?:\n|$)/g, '<li>$1</li>');
    
    // Wrap lists
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');
      // Fix nested lists
      formatted = formatted.replace(/<\/ul><ul>/g, '');
    }
    
    return formatted;
  };
  
  return (
    <div dangerouslySetInnerHTML={{ __html: formatText(children) }} />
  );
};

// Use the mock component if react-markdown is not available
const FallbackAssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  className = ''
}) => {
  return (
    <div className={`p-4 bg-white border border-gray-100 rounded-lg mb-4 ${className}`}>
      <div className="prose max-w-none">
        <MockReactMarkdown>{message}</MockReactMarkdown>
      </div>
    </div>
  );
};

// Export the appropriate component
export default typeof ReactMarkdown !== 'undefined' 
  ? AssistantMessage 
  : FallbackAssistantMessage;