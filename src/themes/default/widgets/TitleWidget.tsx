// src/themes/default/widgets/TitleWidget.tsx
interface TitleWidgetProps {
    title: string;
    attrs?: {
      description?: string;
      size?: "small" | "medium" | "large";
      align?: "left" | "center" | "right";
      colSpan?: string | number;
    };
  }
  
  export default function TitleWidget({ 
    title, 
    attrs = {} 
  }: TitleWidgetProps) {
    const { description, size = "medium", align = "left" } = attrs;
  
    const sizeClasses = {
      small: {
        title: "text-lg font-medium",
        description: "text-sm"
      },
      medium: {
        title: "text-xl font-semibold",
        description: "text-base"
      },
      large: {
        title: "text-2xl font-bold",
        description: "text-lg"
      }
    };
  
    const alignClasses = {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    };
  
    return (
      <div className={`space-y-2 ${alignClasses[align]}`}>
        <h2 className={`${sizeClasses[size].title} text-zinc-900`}>
          {title}
        </h2>
        {description && (
          <p className={`${sizeClasses[size].description} text-zinc-600 leading-relaxed`}>
            {description}
          </p>
        )}
      </div>
    );
  }