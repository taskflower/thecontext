// themes/test/widgets/ButtonWidget.tsx
import { useAppNavigation } from "@/engine";

interface ButtonWidgetProps {
  label: string;
  variant?: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean;
  attrs?: {
    navPath?: string; // Ścieżka zgodna z hookiem nawigacyjnym
    [key: string]: any;
  };
}

const buttonStyles = {
  primary: "bg-blue-500 hover:bg-blue-600 text-white",
  secondary: "bg-gray-500 hover:bg-gray-600 text-white",
  success: "bg-green-500 hover:bg-green-600 text-white",
  danger: "bg-red-500 hover:bg-red-600 text-white",
};

export default function ButtonWidget({
  label,
  variant = "primary",
  disabled = false,
  attrs,
}: ButtonWidgetProps) {
  const { navigateTo } = useAppNavigation();

  const handleClick = () => {
    if (disabled || !attrs?.navPath) return;
    navigateTo(attrs.navPath);
  };

  return (
    <button
      className={`px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 ${buttonStyles[variant]}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
