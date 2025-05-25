// src/themes/test/widgets/InfoWidget.tsx

type InfoVariant = "default" | "info" | "success" | "warning" | "error";

interface InfoWidgetProps {
  title: string;
  attrs?: {
    content: string;
    variant?: InfoVariant;
    colSpan?: string | number;
  };
}

export default function InfoWidget({
  title,
  attrs = { content: "Default content" },
}: InfoWidgetProps) {
  const content = attrs.content || "Default content";  
  const variant = attrs.variant || "default";

  const variants: Record<InfoVariant, string> = {
    default: "bg-white border-zinc-200/80",
    info: "bg-blue-50/50 border-blue-200/80",
    success: "bg-green-50/50 border-green-200/80", 
    warning: "bg-yellow-50/50 border-yellow-200/80",
    error: "bg-red-50/50 border-red-200/80",
  };

  return (
    <div className={`p-6 rounded-lg border ${variants[variant]}`}>
      <h3 className="text-base font-medium mb-3 text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-600 leading-relaxed">{content}</p>
    </div>
  );
}