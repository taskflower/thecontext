// src/themes/clean/widgets/ErrorWidget.tsx
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
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="w-8 h-8 mb-3 text-amber-600" />
      <h3 className="m-0 mb-2 text-red-700 font-medium">Błąd widgetu</h3>
      
      {componentName && (
        <p className="mb-2 p-2 px-3 rounded-md text-sm">
          <code className="p-1 px-2 rounded-md font-mono text-xs">{componentName}</code>
        </p>
      )}
      
      <p className="text-gray-700">{message}</p>
    </div>
  );
}