/**
 * Alternative User Input Component
 */
import React, { useState, KeyboardEvent } from 'react';
import { UserInputProps } from '../../types';

const UserInput: React.FC<UserInputProps> = ({
  value,
  onChange,
  placeholder = 'Type your response...',
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
    <div className={`relative p-5 border-t border-gray-100 ${className}`}>
      <div className="flex items-start mb-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="font-medium text-gray-700">Your Response</div>
      </div>
      
      <div className="pl-12">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className={`w-full p-3 border rounded-xl transition-all ${
            isFocused
              ? 'border-indigo-400 outline-none ring-2 ring-indigo-100'
              : 'border-gray-200 focus:outline-none'
          }`}
        />
        
        {contextKey && (
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              Variable: {contextKey}
              {contextJsonPath && `.${contextJsonPath}`}
            </span>
          </div>
        )}
        
        {onSubmit && (
          <div className="flex justify-end mt-3">
            <button
              onClick={onSubmit}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInput;