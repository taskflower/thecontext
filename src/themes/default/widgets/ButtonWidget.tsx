// src/themes/default/widgets/ButtonWidget.tsx
import { useAppNavigation } from "@/core/hooks/useAppNavigation";

type ButtonWidgetProps = { 
  title: string; 
  attrs: { 
    navURL?: string; 
    variant?: string 
  } 
};

export default function ButtonWidget({ title, attrs }: ButtonWidgetProps) {
  const { go } = useAppNavigation();
  
  // Debug logs
  console.log(`[ButtonWidget] Received props:`, { title, attrs });
  
  const handleClick = () => {
    console.log(`[ButtonWidget] Click detected`);
    console.log(`[ButtonWidget] attrs.navURL:`, attrs.navURL);
    
    if (!attrs.navURL) {
      console.log(`[ButtonWidget] No navURL provided!`);
      return;
    }
    
    console.log(`[ButtonWidget] About to navigate to: ${attrs.navURL}`);
    go(attrs.navURL);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        attrs.variant === "primary"
          ? "bg-zinc-900 text-white hover:bg-zinc-800"
          : attrs.variant === "secondary"
          ? "bg-zinc-600 text-white hover:bg-zinc-700"
          : attrs.variant === "outline"
          ? "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
          : attrs.variant === "danger"
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
      }`}
    >
      {title}
    </button>
  );
}