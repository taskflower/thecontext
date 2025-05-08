// src/themes/default/widgets/InfoWidget.tsx
import { Info, AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

type InfoProps = {
  title?: string;
  data?: string | number | boolean;
  icon?: string;
  actionUrl?: string;
  actionText?: string;
};

export default function InfoWidget({ 
  title, 
  data, 
  icon,
  actionUrl,
  actionText = 'Więcej'
}: InfoProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full border-b border-gray-200">
      {(title || icon) && (
        <div className="flex items-center p-4 border-b border-gray-100">
          {renderIcon()}
          {title && <h3 className="m-0 ml-2 text-sm font-medium text-gray-800">{title}</h3>}
        </div>
      )}
      
      <div className="p-4">
        {data !== undefined ? (
          <div className="flex flex-col">
            <p className="m-0 break-words text-base font-medium text-gray-700">
              {String(data)}
            </p>
            
            {actionUrl && (
              <a 
                href={actionUrl} 
                className="mt-3 inline-flex items-center text-xs font-medium text-gray-600 hover:text-gray-900"
                target="_blank"
                rel="noopener noreferrer"
              >
                {actionText} <ArrowRight className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
        ) : (
          <p className="m-0 text-gray-500 italic text-xs">Brak danych</p>
        )}
      </div>
    </div>
  );
}