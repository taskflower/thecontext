import React from "react";

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  additionalClasses?: string;
  variant?: "narrow" | "full" | "outline" | "full-outline";
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  icon,
  additionalClasses = "",
  variant = "full",
  disabled = false,
}) => {
  // Define base classes for each variant
  const baseClasses = {
    narrow: "px-4 py-2",
    full: "w-full px-5 py-2.5 bg-black text-white",
    outline: "border-2 border-black text-black bg-transparent",
    "full-outline": "w-full border-2 border-black text-black bg-transparent px-5 py-2.5",
  };
  
  // Define hover classes that will only be applied when not disabled
  const hoverClasses = {
    narrow: "",
    full: "hover:bg-gray-800",
    outline: "hover:bg-black hover:text-white",
    "full-outline": "hover:bg-black hover:text-white",
  };
  
  // Choose the appropriate classes based on disabled state
  const variantClass = baseClasses[variant];
  const hoverClass = disabled ? "" : hoverClasses[variant];
  const disabledClass = disabled ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed" : "";

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded transition-colors text-sm font-semibold ${variantClass} ${hoverClass} ${disabledClass} ${additionalClasses}`}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;