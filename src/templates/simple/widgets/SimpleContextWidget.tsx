// src/templates/simple/widgets/SimpleContextWidget.tsx
import React from 'react';
import { WidgetProps } from '@/views/types';
import { useAppStore } from '@/lib/store';

// Interfejs dla pojedynczego pola do wyświetlenia
interface ContextFieldDisplay {
  label: string;
  contextPath: string;
}

// Interfejs dla opcji widgetu
interface SimpleContextWidgetAttrs {
  fields?: ContextFieldDisplay[];
  title?: string;
  theme?: 'minimal' | 'architectural' | 'modern' | 'dark';
}

interface SimpleContextWidgetProps extends WidgetProps {
  attrs?: SimpleContextWidgetAttrs;
}

const SimpleContextWidget: React.FC<SimpleContextWidgetProps> = ({ attrs }) => {
  const { getContextPath } = useAppStore();
  
  // Pobieramy konfigurację z attrs lub używamy domyślnych wartości
  const fields = attrs?.fields || [];
  const title = attrs?.title || 'Kontekst Aplikacji';
  const theme = attrs?.theme || 'architectural';
  
  // Style zależne od wybranego motywu
  const themeStyles = {
    minimal: {
      container: "bg-white p-6",
      header: "text-lg font-normal mb-4 text-gray-700",
      headerAccent: "w-0",
      item: "py-2 border-b border-gray-100 flex",
      label: "text-gray-600 w-1/2 text-sm",
      value: "text-gray-900 w-1/2 font-normal"
    },
    architectural: {
      container: "border-t-2 border-black pt-6",
      header: "text-xl uppercase tracking-wide font-light mb-6 flex items-center",
      headerAccent: "w-8 h-px bg-black mr-4",
      item: "py-3 flex border-b border-gray-100",
      label: "text-gray-500 w-1/3 uppercase text-xs tracking-widest font-medium",
      value: "text-gray-900 w-2/3 font-light"
    },
    modern: {
      container: "bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm",
      header: "text-blue-900 font-bold text-lg mb-4 flex items-center",
      headerAccent: "w-2 h-10 bg-blue-500 rounded mr-3",
      item: "py-2 px-3 rounded mb-2 bg-white bg-opacity-70 flex",
      label: "text-blue-800 font-medium w-1/3",
      value: "text-gray-800 w-2/3"
    },
    dark: {
      container: "bg-gray-800 p-6 rounded-lg",
      header: "text-white font-medium text-lg mb-4 border-b border-gray-700 pb-2",
      headerAccent: "w-0",
      item: "py-3 border-b border-gray-700 flex",
      label: "text-gray-400 w-1/3",
      value: "text-gray-100 w-2/3"
    }
  };
  
  const styles = themeStyles[theme];

  return (
    <div className={styles.container}>
      {/* Nagłówek z akcentem zależnym od motywu */}
      <h2 className={styles.header}>
        {styles.headerAccent !== "w-0" && <span className={styles.headerAccent}></span>}
        {title}
      </h2>
      
      {/* Wyświetlanie pól kontekstu */}
      <div className="space-y-1">
        {fields.length > 0 ? (
          fields.map((field, index) => {
            const value = getContextPath(field.contextPath);
            return (
              <div key={index} className={styles.item}>
                <span className={styles.label}>{field.label}</span>
                <span className={styles.value}>
                  {value !== undefined ? String(value) : '—'}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 italic">Brak zdefiniowanych pól do wyświetlenia</p>
        )}
      </div>
    </div>
  );
};

export default SimpleContextWidget;