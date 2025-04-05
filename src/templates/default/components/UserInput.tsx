/**
 * Default User Input Component
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
    <div className={`relative mb-4 ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        className={`w-full p-3 border rounded-lg transition-colors ${
          isFocused
            ? 'border-blue-400 outline-none ring-2 ring-blue-100'
            : 'border-gray-300 focus:outline-none'
        }`}
      />
      
      {contextKey && (
        <div className="text-xs text-gray-500 mt-1 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          <span>
            Stores to: {contextKey}
            {contextJsonPath && `.${contextJsonPath}`}
          </span>
        </div>
      )}
      
      {onSubmit && (
        <div className="flex justify-end mt-2">
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default UserInput;