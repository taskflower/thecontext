// src/templates/default/widgets/TitleWidget.tsx
import React from "react";

interface TitleWidgetProps {
  title: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
  data?: any;
  onSelect?: (id: string) => void;
}

/**
 * Prosty widget do wyświetlania tytułów sekcji
 */
const TitleWidget: React.FC<TitleWidgetProps> = ({
  title,
  description,
  size = 'medium',
  data,
  onSelect
}) => {
  // Jeśli przekazano dane bezpośrednio jako obiekt z title/description
  const displayTitle = data?.title || title;
  const displayDescription = data?.description || description;
  
  // Mapowanie rozmiaru na klasy
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };
  
  const titleClass = sizeClasses[size] || sizeClasses.medium;
  
  return (
    <div className="mb-6">
      {displayTitle && (
        <h2 className={`font-semibold text-gray-900 ${titleClass}`}>
          {displayTitle}
        </h2>
      )}
      
      {displayDescription && (
        <p className="mt-1 text-sm text-gray-500">
          {displayDescription}
        </p>
      )}
    </div>
  );
};

export default TitleWidget;