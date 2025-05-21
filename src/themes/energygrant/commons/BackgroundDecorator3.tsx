import React from "react";

interface BackgroundDecoratorProps {
  darkMode: boolean;
  useFilter?: boolean;
}

const BackgroundDecorator: React.FC<BackgroundDecoratorProps> = ({
  darkMode,
  useFilter = false,
}) => {
  if (darkMode) return null;
  console.log(useFilter);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M120,-20 L120,120 L30,120 L60,-20 Z"
          fill="#90b981"
          opacity="0.07"
        />
        <path
          d="M140,-20 L140,120 L50,120 L80,-20 Z"
          fill="#34d399"
          opacity="0.03"
        />
      </svg>
    </div>
  );
};

export default BackgroundDecorator;
