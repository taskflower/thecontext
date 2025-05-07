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
      <AlertTriangle className="w-12 h-12 mb-4 text-amber-500" />
      <h2 className="m-0 mb-4 text-red-600">Błąd komponentu</h2>
      
      {componentName && (
        <p className="mb-4 bg-gray-100 p-2 px-4 rounded text-sm">
          Nie można załadować komponentu: <code className="bg-gray-200 p-1 px-2 rounded font-mono">{componentName}</code>
        </p>
      )}
      
      <div className="mb-8 text-gray-600 max-w-[500px]">{error}</div>
      
      <div>
        <button 
          onClick={() => onSubmit({})}
          className="py-2 px-4 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-400"
        >
          Kontynuuj
        </button>
      </div>
    </div>
  );
}