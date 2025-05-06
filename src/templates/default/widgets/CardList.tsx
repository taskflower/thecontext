// src/templates/default/widgets/CardList.tsx
import React from "react";
import { SubjectIcon } from "@/components/SubjectIcon";
import { CardListWidgetProps, CardItem } from "../types";

const CardListWidget: React.FC<CardListWidgetProps> = ({ data = [], title, description }) => {
  // Sprawdzamy, czy data jest tablicą, jeśli nie - zwracamy pustą tablicę
  const items = Array.isArray(data) ? data : [];

  // Obsługa kliknięcia - każda karta ma swoją własną implementację
  const handleCardClick = (item: CardItem) => {
    // Jeśli karta ma zdefiniowaną swoją własną funkcję onClick, użyj jej
    if (typeof item.onClick === 'function') {
      item.onClick(item.id);
      return;
    }
    
    // Jeśli karta ma zdefiniowany link, nawiguj do niego
    if (item.link) {
      window.location.href = item.link;
      return;
    }
    
    // Jeśli nie ma żadnej obsługi kliknięcia, logujemy to dla debugowania
    console.log(`CardList: Kliknięto kartę ${item.id}, ale nie ma zdefiniowanej akcji`);
  };

  if (items.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-yellow-700">Brak danych do wyświetlenia.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: CardItem) => (
          <div
            key={item.id}
            onClick={() => handleCardClick(item)}
            className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="p-5 flex flex-col h-full">
              <div className="mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-100 text-gray-700 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-200">
                  <SubjectIcon iconName={item.icon} size={20} />
                </div>
              </div>
              
              <h2 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h2>
              
              {item.description && (
                <p className="text-sm text-gray-500 mb-4 flex-grow">{item.description}</p>
              )}

              {item.count !== undefined && (
                <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500">
                    {item.count} {item.countLabel || "items"}
                  </p>
                  <div className="text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardListWidget;