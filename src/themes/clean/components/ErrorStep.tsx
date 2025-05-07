// src/themes/clean/components/ErrorStep.tsx
import { AlertTriangle } from 'lucide-react';

type ErrorStepProps = {
  error?: string;
  componentName?: string;
  onSubmit: (data: any) => void;
};

export default function ErrorStep({ 
  error = 'Wystąpił nieoczekiwany błąd', 
  componentName,
  onSubmit 
}: ErrorStepProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <AlertTriangle className="w-12 h-12 mb-4 text-amber-600" />
      <h2 className="m-0 mb-4 text-xl font-semibold text-red-700">Błąd komponentu</h2>
      
      {componentName && (
        <p className="mb-4 p-2 px-4 rounded-md text-sm">
          Nie można załadować komponentu: <code className="p-1 px-2 rounded-md font-mono text-xs">{componentName}</code>
        </p>
      )}
      
      <div className="mb-8 text-gray-700 max-w-[500px]">{error}</div>
      
      <div>
        <button 
          onClick={() => onSubmit({})}
          className="py-2 px-4 bg-slate-800 text-white rounded-md font-medium hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Kontynuuj
        </button>
      </div>
    </div>
  );
}