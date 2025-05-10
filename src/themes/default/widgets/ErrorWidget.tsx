// src/themes/default/widgets/ErrorWidget.tsx
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
    <div data-name="error-widget" className="flex flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="w-6 h-6 mb-2 text-amber-500" />
      <h3 className="m-0 mb-2 text-red-600 font-semibold text-sm">Błąd widgetu</h3>
      
      {componentName && (
        <p className="mb-2 bg-gray-50 p-2 px-3 rounded text-xs border border-gray-200">
          <code className="bg-gray-100 p-1 px-2 rounded font-mono text-xs">{componentName}</code>
        </p>
      )}
      
      <p className="text-gray-600 text-xs">{message}</p>
    </div>
  );
}