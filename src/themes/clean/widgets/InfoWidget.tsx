// src/themes/clean/widgets/InfoWidget.tsx
import { Info, AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

type InfoProps = {
  title?: string;
  data?: string | number | boolean;
  icon?: string;
  actionUrl?: string;
  actionText?: string;
  variant?: 'default' | 'outlined' | 'filled';
};

export default function InfoWidget({ 
  title, 
  data, 
  icon,
  actionUrl,
  actionText = 'Więcej',
  variant = 'default'
}: InfoProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden h-full">
      <div className="p-4 border-b border-zinc-100">
        <div className="flex items-center">
          {renderIcon()}
          {title && <h3 className="text-lg font-medium ml-2 text-slate-800">{title}</h3>}
        </div>
      </div>
      
      <div className="p-4">
        {data !== undefined ? (
          <div className="flex flex-col">
            <p className="text-slate-800 text-base">
              {String(data)}
            </p>
            
            {actionUrl && (
              <a 
                href={actionUrl} 
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {actionText} <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            )}
          </div>
        ) : (
          <p className="text-zinc-500 italic">Brak danych</p>
        )}
      </div>
    </div>
  );
}