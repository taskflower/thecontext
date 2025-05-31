// src/themes/default/widgets/InfoWidget.tsx
import TitleWidget from "./TitleWidget";

type InfoVariant = "default" | "info" | "success" | "warning" | "error";

interface InfoWidgetProps {
  title: string;
  attrs?: {
    content?: string;
    description?: string;
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
  const description = attrs.description;

  const variants: Record<InfoVariant, string> = {
    default: "bg-white border-zinc-200/80",
    info: "bg-blue-50/50 border-blue-200/80",
    success: "bg-green-50/50 border-green-200/80",
    warning: "bg-yellow-50/50 border-yellow-200/80",
    error: "bg-red-50/50 border-red-200/80",
  };

  return (
    <div className={`p-6 rounded-lg border ${variants[variant]}`}>
      <div className="mb-4">
        <TitleWidget
          title={title}
          attrs={{
            description: description,
            size: "small",
          }}
        />
      </div>
      <p className="text-sm text-zinc-600 leading-relaxed">{content}</p>
    </div>
  );
}
