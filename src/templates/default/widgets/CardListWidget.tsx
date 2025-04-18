// src/templates/common/widgets/IconCardListWidget.tsx
import React from "react";
import { WidgetProps } from "../../../views/types";
import { IconCard } from "../../../components/IconCard";

interface CardItemData {
  id: string;
  name: string;
  description?: string;
  count?: number;
  countLabel?: string;
  icon?: string;
}

const CardListWidget: React.FC<WidgetProps> = ({ data = [], onSelect }) => {
  // Jeśli brak danych, wyświetl komunikat
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Brak dostępnych elementów.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {data.map((item: CardItemData) => (
        <IconCard
          key={item.id}
          id={item.id}
          name={item.name}
          description={item.description}
          count={item.count}
          countLabel={item.countLabel}
          icon={item.icon}
          onClick={() => onSelect && onSelect(item.id)}
        />
      ))}
    </div>
  );
};

export default CardListWidget;