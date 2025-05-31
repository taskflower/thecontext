import { useAppNavigation } from "@/core";
import I from "../I";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonWidgetProps = {
  title: string;
  attrs: {
    navURL?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: string;
    fullWidth?: boolean;
  };
};

export default function ButtonWidget({ title, attrs }: ButtonWidgetProps) {
  const { go } = useAppNavigation();

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const variant = attrs.variant || "primary";
  const size = attrs.size || "md";

  return (
    <button
      onClick={() => attrs.navURL && go(attrs.navURL)}
      className={`
        rounded-md font-medium transition-all focus:outline-none focus:ring-2
        ${variants[variant]}
        ${sizes[size]}
        ${attrs.fullWidth ? "w-full" : ""}
        flex items-center justify-center gap-2
      `}
    >
      {attrs.icon && <I name={attrs.icon} className="w-5 h-5 stroke-2" />}
      {title}
    </button>
  );
}