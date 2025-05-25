// src/themes/test/widgets/ButtonWidget.tsx
import { useNavigate, useParams } from "react-router-dom";

export default function ButtonWidget(props: any) {
  const navigate = useNavigate();
  const { config } = useParams<{ config: string }>();
  const cfg = config || "testApp";

  // Sprawdź różne możliwe struktury props
  const label = props.label || props.title || "Click";
  const variant = props.variant || "primary";

  // attrs może być w props.attrs lub bezpośrednio w props
  const attrs = props.attrs || props;
  const navPath = attrs.navPath;

  console.log("ButtonWidget props:", props); // Debug log
  console.log("ButtonWidget attrs:", attrs); // Debug log
  console.log("ButtonWidget navPath:", navPath); // Debug log

  const colors = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    default: "bg-gray-100 hover:bg-gray-200 text-gray-900",
  };

  const handleClick = () => {
    if (navPath) {
      const fullPath = `/${cfg}/${navPath}`;
      console.log("Navigating to:", fullPath); // Debug log
      navigate(fullPath);
    } else {
      console.warn("No navPath defined for button:", label);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${
        colors[variant] || colors.primary
      } px-4 py-2 rounded font-medium transition-colors duration-200 ${
        !navPath ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={!navPath}
    >
      {label}
    </button>
  );
}
