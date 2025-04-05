/**
 * E-Learning User Input Component
 */
import React, { useState, KeyboardEvent } from 'react';
import { UserInputProps } from '../../types';

const UserInput: React.FC<UserInputProps> = ({
  value,
  onChange,
  placeholder = 'Type your answer here...',
  onSubmit,
  contextKey,
  contextJsonPath,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Handle keyboard events (Submit on Enter)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };
  
  return (
    <div className={`bg-white rounded-lg border border-blue-100 shadow-sm p-6 ${className}`}>
      <div className="flex items-center mb-4 pb-4 border-b border-blue-50">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-gray-800">Your Response</div>
          <div className="text-xs text-gray-500">Please answer the question</div>
        </div>
      </div>
      
      <div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={4}
          className={`w-full p-3 border rounded-md transition-colors ${
            isFocused
              ? 'border-blue-400 outline-none ring-2 ring-blue-100'
              : 'border-gray-200 focus:outline-none hover:border-blue-200'
          }`}
        />
        
        {contextKey && (
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              Your answer will be saved as <span className="text-blue-600 font-medium">{contextKey}</span>
              {contextJsonPath && <span className="text-gray-400"> in {contextJsonPath}</span>}
            </span>
          </div>
        )}
        
        {onSubmit && (
          <div className="flex justify-center mt-4">
            <button
              onClick={onSubmit}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center"
            >
              <span>Submit Answer</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInput;