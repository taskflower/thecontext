// src/themes/test/widgets/InfoWidget.tsx

type InfoVariant = "default" | "info" | "success" | "warning" | "error";

interface InfoWidgetProps {
  title: string;  // Tytuł widgetu
  attrs?: {  // attrs może być opcjonalne
    content: string;  // Treść widgetu
    variant?: InfoVariant;
    colSpan?: string | number;  // Przekazanie colSpan w attrs
  };
}

export default function InfoWidget({
  title,
  attrs = { content: "Default content" },  // Domyślnie ustawiamy pusty obiekt w przypadku braku danych
}: InfoWidgetProps) {
  // Ustawiamy domyślną wartość, jeśli content nie jest przekazany
  const content = attrs.content || "Default content";  
  const variant = attrs.variant || "default";  // Domyślny wariant, jeśli nie podano

  const colors: Record<InfoVariant, string> = {
    default: "bg-white border-gray-200",
    info: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    error: "bg-red-50 border-red-200",
  };

  return (
    <div className={`p-6 rounded-lg border ${colors[variant]} shadow-sm`}>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}
