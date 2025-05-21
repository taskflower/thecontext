import React, { ReactNode } from "react";
import { useDarkMode } from "../utils/ThemeUtils";
import { Footer } from "../commons/Footer";
import { HousePlug } from "lucide-react";

interface PublicProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const Public: React.FC<PublicProps> = ({
  children,
  title = "mOperator",
  subtitle = "Program Dotacji Energetycznych",
}) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode
          ? "bg-zinc-900 text-zinc-100"
          : "bg-gradient-to-br from-emerald-50 via-zinc-50 to-blue-50 text-zinc-900"
      }`}
    >
      {/* Modern background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
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
        </svg>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10">
        <div
          className={`w-full max-w-xl ${
            darkMode
              ? "bg-zinc-800/80 border-zinc-700"
              : "bg-white/80 border-zinc-100"
          } border rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden transition-all`}
        >
          {/* Modern header area */}
          <div className="relative">
            {/* Decorative header accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500"></div>

            <div className="pt-8 px-8">
              {/* Logo with modern styling */}
              <div className="flex justify-center mb-6 relative">
                <div className="relative">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-md transform scale-110 opacity-30 animate-pulse"
                    style={{ animationDuration: "3s" }}
                  ></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <HousePlug className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Modern typography */}
              <div className="text-center mb-8">
                <h1
                  className={`text-3xl font-bold tracking-tight ${
                    darkMode ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {title}
                </h1>
                <p
                  className={`mt-2 ${
                    darkMode ? "text-zinc-300" : "text-zinc-600"
                  } font-medium`}
                >
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Content area with subtle separator */}
          <div className="px-8 pb-8 pt-2">{children}</div>

          {/* Modern footer */}
          <div
            className={`px-8 py-4 ${
              darkMode
                ? "bg-zinc-800/50 border-zinc-700"
                : "bg-zinc-50/50 border-zinc-200"
            } border-t backdrop-blur-sm`}
          >
            <p
              className={`text-xs text-center ${
                darkMode ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Logując się, akceptujesz nasze{" "}
              <a
                href="/workspace-user-legal-info/user-legal-info/terms-of-service"
                className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
              >
                Warunki korzystania
              </a>{" "}
              i{" "}
              <a
                href="/workspace-user-legal-info/user-legal-info/privacy-policy"
                className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
              >
                Politykę prywatności
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer with improved styling */}
      <Footer
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        minimal={true}
      />
    </div>
  );
};

export default Public;
