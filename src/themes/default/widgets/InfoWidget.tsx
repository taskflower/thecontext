
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

type InfoProps = {
  title?: string;
  data?: string | number | boolean;
  icon?: string;
};

export default function InfoWidget({ title, data, icon }: InfoProps) {
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

  return (
    <div className="p-4 h-full">
      <div className="flex items-center mb-2">
        {renderIcon()}
        {title && <h3 className="m-0 ml-2 text-base font-medium">{title}</h3>}
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        {data !== undefined ? (
          <p className="m-0 break-words">{String(data)}</p>
        ) : (
          <p className="m-0 text-gray-500 italic">Brak danych</p>
        )}
      </div>
    </div>
  );
}