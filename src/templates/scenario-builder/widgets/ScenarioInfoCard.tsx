// src/templates/scenario-builder/widgets/ScenarioInfoCard.tsx
import React from "react";
import { SubjectIcon } from "@/components/SubjectIcon";

interface ScenarioInfoCardProps {
  title?: string;
  description?: string;
  data?: {
    name?: string;
    description?: string;
    icon?: string;
    [key: string]: any;
  };
  onSelect?: (id: string) => void;
}

const ScenarioInfoCard: React.FC<ScenarioInfoCardProps> = ({
  title,
  description,
  data = {},
  onSelect
}) => {
  const scenarioName = data.name || "Nienazwany scenariusz";
  const scenarioDescription = data.description || "Brak opisu";
  const scenarioIcon = data.icon || "folder-kanban";

  const handleEdit = () => {
    onSelect && onSelect("edit-basic-info");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">
          {title || "Informacje o scenariuszu"}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 flex items-center justify-center rounded-md bg-blue-100 text-blue-700">
              <SubjectIcon iconName={scenarioIcon} size={24} />
            </div>
          </div>
          
          <div className="ml-4 flex-1">
            <h4 className="text-lg font-medium text-gray-900">{scenarioName}</h4>
            <p className="mt-1 text-sm text-gray-500">{scenarioDescription}</p>

            {data.useTemplateId && (
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Bazuje na szablonie
              </div>
            )}
          </div>
          
          <button
            onClick={handleEdit}
            className="ml-4 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            title="Edytuj informacje"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>

        {/* Dodatkowe metadane */}
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs font-medium text-gray-500">Utworzono</p>
            <p className="text-sm text-gray-900">
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Ostatnia edycja</p>
            <p className="text-sm text-gray-900">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioInfoCard;