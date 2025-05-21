import React from "react";

interface BackgroundDecoratorProps {
  darkMode: boolean;
  useFilter?: boolean;
}

const BackgroundDecorator: React.FC<BackgroundDecoratorProps> = ({ 
  darkMode, 
  useFilter = false 
}) => {
  if (darkMode) return null;
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {useFilter && (
          <defs>
            <filter
              id="ny-shadow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="17"
                result="base-blur"
              />
              <feOffset in="base-blur" dx="15" dy="20" result="offset-main" />
              <feComponentTransfer in="offset-main" result="shadow-main">
                <feFuncA type="linear" slope="1.75" />
              </feComponentTransfer>

              <feOffset
                in="base-blur"
                dx="-3"
                dy="17"
                result="offset-secondary"
              />
              <feGaussianBlur
                in="offset-secondary"
                stdDeviation="5"
                result="blur-secondary"
              />
              <feComponentTransfer
                in="blur-secondary"
                result="shadow-secondary"
              >
                <feFuncA type="linear" slope="0.4" />
              </feComponentTransfer>

              <feSpecularLighting
                in="base-blur"
                surfaceScale="5"
                specularConstant="1"
                specularExponent="20"
                lighting-color="#007a60"
                result="specular"
              >
                <fePointLight x="50" y="-50" z="200" />
              </feSpecularLighting>
              <feComposite
                in="specular"
                in2="SourceAlpha"
                operator="in"
                result="specular-comp"
              />

              <feMerge>
                <feMergeNode in="shadow-main" />
                <feMergeNode in="shadow-secondary" />
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="specular-comp" />
              </feMerge>
            </filter>
          </defs>
        )}
        
        {useFilter ? (
          <g filter="url(#ny-shadow)">
            <path
              d="M120,-20 L120,120 L30,120 L60,-20 Z"
              fill="#90b981"
              opacity="0.1"
            />
            <path
              d="M140,-20 L140,120 L50,120 L80,-20 Z"
              fill="#34d399"
              opacity="0.05"
            />
            <path
              d="M160,-20 L160,120 L70,120 L100,-20 Z"
              fill="#059679"
              opacity="0.05"
            />
          </g>
        ) : (
          <>
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
          </>
        )}
      </svg>
    </div>
  );
};

export default BackgroundDecorator;