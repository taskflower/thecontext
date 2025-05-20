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
  title = "e-operator",
  subtitle = "Program Dotacji Energetycznych",
}) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode
          ? "bg-zinc-950 text-zinc-50"
          : "bg-gradient-to-b from-emerald-50 to-zinc-100 text-zinc-900"
      }`}
    >
      {/* Tło z elementami energetycznymi - zmodyfikowane do kształtu połówki trapezu */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="fixed top-0 right-0 w-1/2 h-full opacity-20">
          <svg
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M120,-20 L120,120 L30,120 L60,-20 Z"
              fill={darkMode ? "#059669" : "#10b981"}
              opacity="0.15"
            />
            <path
              d="M140,-20 L140,120 L50,120 L80,-20 Z"
              fill={darkMode ? "#047857" : "#34d399"}
              opacity="0.2"
            />
            <path
              d="M160,-20 L160,120 L70,120 L100,-20 Z"
              fill={darkMode ? "#065f46" : "#059669"}
              opacity="0.25"
            />
          </svg>
        </div>

        {/* Elementy tematyczne - zielona energia */}
        <div className="fixed inset-0 flex items-center justify-center opacity-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-emerald-600"
            >
              <circle cx="500" cy="500" r="300" />
              <circle cx="500" cy="500" r="350" opacity="0.6" />
              <circle cx="500" cy="500" r="400" opacity="0.3" />
            </g>
          </svg>
        </div>
      </div>

      {/* Główna zawartość */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10">
        <div
          className={`w-full max-w-xl ${
            darkMode
              ? "bg-zinc-900 border-zinc-800"
              : "bg-white border-zinc-200"
          } border rounded-xl shadow-xl overflow-hidden transform transition-all`}
        >
          {/* Logo i nagłówek - zawsze widoczne */}
          <div
            className={`p-1 ${
              darkMode ? "bg-zinc-900" : "bg-white"
            } relative border-b`}
          >
            <div className="flex justify-center p-10">
              {/* Logo programu dotacji energetycznych */}
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500 opacity-10 animate-pulse absolute"></div>
                <HousePlug className="w-10 h-10 z-10 relative text-green-800" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1
                className={`text-3xl font-bold tracking-tight ${
                  darkMode ? "text-white" : "text-zinc-900"
                }`}
              >
                {title}
              </h1>
              <p
                className={`mt-2 ${
                  darkMode ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                {subtitle}
              </p>
            </div>
          </div>

          {/* Zawartość strony - dynamiczna część */}
          <div className="px-8 pb-8">{children}</div>

          {/* Stopka z informacją prawną */}
          <div
            className={`px-8 py-4 border-t ${
              darkMode
                ? "bg-zinc-900 border-zinc-800"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <p
              className={`text-xs text-center ${
                darkMode ? "text-zinc-500" : "text-zinc-600"
              }`}
            >
              Logując się, akceptujesz nasze{" "}
              <a
                href="/workspace-user-legal-info/user-legal-info/terms-of-service"
                className="text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Warunki korzystania
              </a>{" "}
              i{" "}
              <a
                href="/workspace-user-legal-info/user-legal-info/privacy-policy"
                className="text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Politykę prywatności
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        minimal={true}
      />
    </div>
  );
};

export default Public;
