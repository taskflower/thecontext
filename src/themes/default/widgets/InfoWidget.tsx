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
        return <Info className="w-5 h-5 text-slate-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getContainerClasses = () => {
    switch (variant) {
      case 'outlined':
        return "border rounded-lg border-gray-200 h-full shadow-sm";
      case 'filled':
        return "h-full rounded-lg shadow-sm " + getColorByIcon();
      case 'default':
      default:
        return "h-full";
    }
  };

  const getColorByIcon = () => {
    switch (icon) {
      case 'info':
        return "bg-slate-50 border border-slate-200";
      case 'warning':
        return "bg-amber-50 border border-amber-200";
      case 'success':
        return "bg-green-50 border border-green-200";
      case 'error':
        return "bg-red-50 border border-red-200";
      default:
        return "bg-gray-50 border border-gray-200";
    }
  };

  const getHeaderClasses = () => {
    if (variant === 'filled') {
      return "flex items-center mb-2 p-4 pb-2";
    }
    return "flex items-center mb-2 p-4";
  };

  const getContentClasses = () => {
    switch (variant) {
      case 'outlined':
        return "bg-gray-50 p-4 rounded-b-lg";
      case 'filled':
        return "p-4 pt-0";
      case 'default':
      default:
        return "bg-gray-50 p-4 rounded-md border border-gray-200";
    }
  };

  return (
    <div className={getContainerClasses()}>
      {(title || icon) && (
        <div className={getHeaderClasses()}>
          {renderIcon()}
          {title && <h3 className="m-0 ml-2 text-base font-medium text-slate-800">{title}</h3>}
        </div>
      )}
      
      <div className={getContentClasses()}>
        {data !== undefined ? (
          <div className="flex flex-col">
            <p className="m-0 break-words text-lg font-medium text-slate-700">
              {String(data)}
            </p>
            
            {actionUrl && (
              <a 
                href={actionUrl} 
                className="mt-3 inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                {actionText} <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            )}
          </div>
        ) : (
          <p className="m-0 text-gray-500 italic">Brak danych</p>
        )}
      </div>
    </div>
  );
}