// src/components/WidgetRenderer.tsx
import React from "react";
import { WidgetProps } from "@/types";
import { useComponents } from "@/hooks";

interface WidgetRendererProps extends WidgetProps {
  type?: string;
  title?: string;
  description?: string;
  data?: any;
  onSelect?: (id: string) => void;
  tplFile?: string;  // Dodane właściwość tplFile
  [key: string]: any;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  type,
  tplFile,  // Używamy tplFile zamiast type
  title,
  description,
  data,
  onSelect,
  ...rest
}) => {
  // Używamy tplFile jako głównego identyfikatora typu komponentu
  const componentType = tplFile || type || 'default';
  
  const {
    component: Widget,
    error,
    isLoading,
  } = useComponents("widget", componentType);

  if (isLoading) {
    return <div className="p-4 text-gray-500">Ładowanie widgetu...</div>;
  }

  if (error || !Widget) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
        <p className="font-medium">Błąd ładowania widgetu</p>
        <p className="text-sm mt-1">
          Nie znaleziono komponentu typu: {componentType}
        </p>
        {error && <p className="text-xs mt-2">{error}</p>}
      </div>
    );
  }

  // Przekazujemy dane również dla CardList, ale będzie ich używał tylko jeśli są potrzebne
  if (componentType === "CardList") {
    return <Widget data={data} onSelect={onSelect} {...rest} />;
  }

  // Dla pozostałych widgetów przekazujemy standardowe props
  return <Widget title={title} description={description} data={data} onSelect={onSelect} {...rest} />;
};

export default WidgetRenderer;