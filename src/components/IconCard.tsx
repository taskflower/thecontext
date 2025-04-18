// src/components/IconCard.tsx
import React from "react";
import { SubjectIcon } from "./SubjectIcon";

interface IconCardProps {
  id: string;
  name: string;
  description?: string;
  count?: number;
  countLabel?: string;
  icon?: string;
  onClick?: () => void;
}

export const IconCard: React.FC<IconCardProps> = ({
  id,
  name,
  description,
  count,
  countLabel = "items",
  icon,
  onClick
}) => {
  return (
    <div
      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-blue-50 rounded-lg flex items-center justify-center">
          <SubjectIcon 
            iconName={icon} 
            size={24} 
            className="text-blue-600" 
            fallback="GraduationCap" 
          />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{name}</h3>
          
          {description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
          )}
          
          {typeof count === 'number' && (
            <div className="mt-2 text-xs font-medium text-gray-500">
              {count} {countLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IconCard;