
import { AlertTriangle } from 'lucide-react';

type ErrorProps = {
  message?: string;
  componentName?: string;
};

export default function ErrorWidget({ 
  message = 'Nie można załadować widgetu', 
  componentName 
}: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="w-8 h-8 mb-2 text-amber-500" />
      <h3 className="m-0 mb-2 text-red-600">Błąd widgetu</h3>
      
      {componentName && (
        <p className="mb-2 bg-gray-100 p-2 px-3 rounded text-sm">
          <code className="bg-gray-200 p-1 px-2 rounded font-mono">{componentName}</code>
        </p>
      )}
      
      <p className="text-gray-600">{message}</p>
    </div>
  );
}