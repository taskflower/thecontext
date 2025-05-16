// src/themes/default/commons/ActionButton.tsx
import React from "react";

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  additionalClasses?: string;
  variant?: "narrow" | "full" | "outline" | "full-outline"; // Dodano "full-outline"
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  icon,
  additionalClasses = "",
  variant = "full", // Domyślny wariant to "full"
}) => {
  const buttonClasses = {
    narrow: "px-4 py-2", // Wąski przycisk
    full: "w-full px-5 py-2.5 bg-black text-white hover:bg-gray-800", // Przyciski rozciągnięte na całą szerokość
    outline:
      "border-2 border-black text-black bg-transparent hover:bg-black hover:text-white", // Przyciski w wersji outline
    "full-outline":
      "w-full border-2 border-black text-black bg-transparent hover:bg-black hover:text-white px-5 py-2.5", // Rozciągnięty przycisk outline
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded transition-colors text-sm font-semibold ${buttonClasses[variant]} ${additionalClasses}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;
