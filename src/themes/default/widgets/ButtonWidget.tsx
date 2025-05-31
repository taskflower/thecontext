// src/themes/default/widgets/ButtonWidget.tsx - Modern Dropbox Style
import { useAppNavigation } from "@/core/hooks/useAppNavigation";

type ButtonWidgetProps = { 
  title: string; 
  attrs: { 
    navURL?: string; 
    variant?: "primary" | "secondary" | "outline" | "danger" | "success";
    size?: "sm" | "md" | "lg";
    icon?: string;
    fullWidth?: boolean;
  } 
};

export default function ButtonWidget({ title, attrs }: ButtonWidgetProps) {
  const { go } = useAppNavigation();
  
  const handleClick = () => {
    if (!attrs.navURL) {
      console.log(`[ButtonWidget] No navURL provided!`);
      return;
    }
    
    console.log(`[ButtonWidget] Navigating to: ${attrs.navURL}`);
    go(attrs.navURL);
  };

  const getVariantClasses = () => {
    const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 focus:ring-blue-500",
      secondary: "text-white bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 hover:shadow-lg hover:shadow-slate-500/25 hover:-translate-y-0.5 focus:ring-slate-500",
      outline: "text-slate-700 bg-white border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:ring-slate-500",
      danger: "text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5 focus:ring-red-500",
      success: "text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 focus:ring-green-500"
    };
    
    return `${base} ${variants[attrs.variant || "primary"]}`;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg"
    };
    
    return sizes[attrs.size || "md"];
  };

  const getIconElement = () => {
    if (!attrs.icon) return null;
    
    // Map common icon names to SVG icons
    const iconMap: Record<string, JSX.Element> = {
      plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      edit: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      delete: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      save: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      arrow: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      )
    };
    
    return iconMap[attrs.icon] || (
      <span className="w-5 h-5 flex items-center justify-center text-sm">
        {attrs.icon}
      </span>
    );
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${getVariantClasses()} 
        ${getSizeClasses()} 
        ${attrs.fullWidth ? 'w-full' : ''}
        group
      `}
    >
      {attrs.icon && (
        <span className="mr-2 group-hover:scale-110 transition-transform duration-200">
          {getIconElement()}
        </span>
      )}
      
      <span className="font-semibold">{title}</span>
      
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 pointer-events-none"></div>
    </button>
  );
}