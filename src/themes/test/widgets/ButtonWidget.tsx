// src/themes/test/widgets/ButtonWidget.tsx
import { useNavigate, useParams } from "react-router-dom";

interface ButtonWidgetProps {
  title: string;  
  attrs: {
    navPath?: string;  
    variant?: string; 
  };
}

export default function ButtonWidget({
  title,
  attrs,
}: ButtonWidgetProps) {
  const navigate = useNavigate();
  const { config } = useParams<{ config: string }>();
  const cfg = config || "exampleTicketApp"; 
  const fullPath = attrs?.navPath ? `/${cfg}/${attrs.navPath}` : null;

  const variants: Record<string, string> = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900",
    secondary: "bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-300",
    default: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-zinc-200",
  };

  const handleClick = () => {
    if (fullPath) {
      navigate(fullPath);
    } else {
      console.warn("No navPath defined for button:", title);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${variants[attrs?.variant || "default"]} w-full px-4 py-2 text-sm font-medium border rounded-md transition-colors duration-200 ${
        !attrs?.navPath ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={!attrs?.navPath}
    >
      {title}
    </button>
  );
}