// src/themes/default/widgets/TitleWidget.tsx
import { useFlow } from "@/core"; // Import useFlow from your core module
import { useMemo } from 'react';

type TitleProps = {
  title: string;
  subtitle?: string;
};

export default function TitleWidget({ title, subtitle}: TitleProps) {
  const { get } = useFlow(); // Get the flow context
  
  // Funkcja do przetwarzania szablonów
  const processTemplateString = useMemo(() => 
    (str: string) => 
      str.replace(/{{([^}]+)}}/g, (_, path) => {
        const value = get(path.trim());
        return value !== undefined ? String(value) : "";
      }),
    [get]
  );
  
  // Przetwarzanie tytułu i podtytułu
  const processedTitle = useMemo(() => 
    processTemplateString(title), 
    [processTemplateString, title]
  );
  
  const processedSubtitle = useMemo(() => 
    subtitle ? processTemplateString(subtitle) : undefined, 
    [processTemplateString, subtitle]
  );
  
  return (
    <div className="p-4 border-b border-gray-100">
      <h3 className={`m-0 text-lg font-semibold text-gray-900`}>{processedTitle}</h3>
      {processedSubtitle && (
        <p className="mt-2 mb-0 text-gray-500 text-sm">{processedSubtitle}</p>
      )}
    </div>
  );
}