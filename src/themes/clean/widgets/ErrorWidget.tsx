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
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
      <AlertTriangle className="h-8 w-8 " />
      <h3 className="text-red-500 font-medium">Błąd widgetu</h3>
      
      {componentName && (
        <div className="bg-zinc-100 rounded-md p-2">
          <code className="text-xs font-mono">{componentName}</code>
        </div>
      )}
      
      <p className="text-zinc-600 text-xs">{message}</p>
    </div>
  );
}