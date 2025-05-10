// src/themes/default/components/ErrorStep.tsx
import { ErrorStepProps } from '@/themes/themeTypes';
import { AlertTriangle } from 'lucide-react';



export default function ErrorStep({ 
  error = 'Wystąpił nieoczekiwany błąd', 
  componentName,
  onSubmit 
}: ErrorStepProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <AlertTriangle className="w-12 h-12 mb-4 text-amber-500" />
      <h2 className="m-0 mb-4 text-xl font-medium text-red-600">Błąd komponentu</h2>
      
      {componentName && (
        <p className="mb-4 bg-gray-100 p-3 px-4 rounded text-sm border border-gray-200">
          Nie można załadować komponentu: <code className="bg-gray-200 p-1 px-2 rounded font-mono text-xs">{componentName}</code>
        </p>
      )}
      
      <div className="mb-8 text-gray-700 max-w-[500px]">{error}</div>
      
      <div>
        <button 
          onClick={() => onSubmit({})}
          className="px-5 py-3 rounded transition-colors text-base font-medium bg-black text-white hover:bg-gray-800"
        >
          Kontynuuj
        </button>
      </div>
    </div>
  );
}