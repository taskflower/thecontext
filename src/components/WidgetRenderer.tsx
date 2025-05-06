// src/components/WidgetRenderer.tsx
import React from "react";
import { WidgetProps } from "@/types";
import { useComponents } from "@/hooks";

interface WidgetRendererProps extends WidgetProps {
  type?: string;
  title?: string;
  description?: string;
  data?: any;
  tplFile?: string;  // Dodane właściwość tplFile
  [key: string]: any;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  type,
  tplFile,  // Używamy tplFile zamiast type
  title,
  description,
  data,
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

  // Usuwamy undefined props, aby uniknąć nadpisywania domyślnych wartości
  const allProps = {
    ...rest,
    title,
    description,
    data
  };
  
  Object.keys(allProps).forEach(key => 
    allProps[key] === undefined && delete allProps[key]
  );
  
  return <Widget {...allProps} />;
};

export default WidgetRenderer;