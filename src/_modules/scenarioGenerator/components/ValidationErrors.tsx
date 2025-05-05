// src/_modules/scenarioGenerator/components/ValidationErrors.tsx
import React from 'react';
import { ValidationResult } from '../types';

interface ValidationErrorsProps {
  error: string | null;
  validationResult: ValidationResult;
}

const ValidationErrors: React.FC<ValidationErrorsProps> = ({ 
  error, 
  validationResult 
}) => {
  if (!error && validationResult.valid) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {!validationResult.valid && validationResult.errors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          <p className="font-medium">Validation Errors</p>
          <ul className="list-disc list-inside">
            {validationResult.errors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationErrors;