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
    <div className="max-w-3xl mx-auto bg-white rounded-lg border border-slate-200 shadow-sm p-8">
      <div className="flex flex-col items-center justify-center text-center min-h-[300px]">
        <AlertTriangle className="w-12 h-12 mb-4 text-amber-500" />
        <h2 className="text-xl font-semibold text-red-600 mb-4">Błąd komponentu</h2>
        
        {componentName && (
          <div className="mb-4 w-full max-w-md">
            <p className="inline-block bg-slate-50 px-3 py-2 rounded-md text-sm border border-slate-200">
              Nie można załadować komponentu: <code className="bg-slate-100 px-2 py-1 rounded font-mono text-xs">{componentName}</code>
            </p>
          </div>
        )}
        
        <div className="mb-8 text-slate-600 max-w-md">{error}</div>
        
        <button 
          onClick={() => onSubmit({})}
          className="px-4 py-2 bg-slate-800 text-white rounded-md shadow-sm font-medium hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Kontynuuj
        </button>
      </div>
    </div>
  );
}
