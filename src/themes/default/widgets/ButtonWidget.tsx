// src/themes/default/widgets/ButtonWidget.tsx - Minimalna wersja
import { useAppNavigation } from "@/core/hooks/useAppNavigation";

type ButtonWidgetProps = { 
  title: string; 
  attrs: { navURL?: string; variant?: string; size?: string; icon?: string; fullWidth?: boolean } 
};

export default function ButtonWidget({ title, attrs }: ButtonWidgetProps) {
  const { go } = useAppNavigation();
  
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    outline: "border-2 border-gray-300 hover:bg-gray-50 text-gray-700"
  };
  
  const sizes = { sm: "px-3 py-1 text-sm", md: "px-4 py-2", lg: "px-6 py-3 text-lg" };
  
  const icons = {
    plus: <path d="M12 4v16m8-8H4" />,
    edit: <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    delete: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  };

  return (
    <button
      onClick={() => attrs.navURL && go(attrs.navURL)}
      className={`
        rounded-md font-medium transition-all focus:outline-none focus:ring-2
        ${variants[attrs.variant] || variants.primary}
        ${sizes[attrs.size] || sizes.md}
        ${attrs.fullWidth ? 'w-full' : ''}
        flex items-center justify-center gap-2
      `}
    >
      {attrs.icon && icons[attrs.icon] && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[attrs.icon]}
        </svg>
      )}
      {title}
    </button>
  );
}