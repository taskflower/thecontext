import { Info, AlertTriangle, CheckCircle, XCircle, ArrowUpRight, ArrowRight } from 'lucide-react';

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
  // Funkcja do renderowania ikony
  const renderIcon = () => {
    switch (icon) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Klasy CSS dla różnych wariantów
  const getContainerClasses = () => {
    switch (variant) {
      case 'outlined':
        return "border rounded-lg border-gray-200 h-full";
      case 'filled':
        return "h-full rounded-lg " + getColorByIcon();
      case 'default':
      default:
        return "h-full";
    }
  };

  const getColorByIcon = () => {
    switch (icon) {
      case 'info':
        return "bg-blue-50 border border-blue-100";
      case 'warning':
        return "bg-amber-50 border border-amber-100";
      case 'success':
        return "bg-green-50 border border-green-100";
      case 'error':
        return "bg-red-50 border border-red-100";
      default:
        return "bg-gray-50 border border-gray-100";
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
        return "bg-gray-100 p-4 rounded";
    }
  };

  return (
    <div className={getContainerClasses()}>
      <div className={getHeaderClasses()}>
        {renderIcon()}
        {title && <h3 className="m-0 ml-2 text-base font-medium">{title}</h3>}
      </div>
      
      <div className={getContentClasses()}>
        {data !== undefined ? (
          <div className="flex flex-col">
            <p className="m-0 break-words text-lg font-medium">
              {String(data)}
            </p>
            
            {actionUrl && (
              <a 
                href={actionUrl} 
                className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
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