// src/themes/energygrant/pages/LoginPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../utils/ThemeUtils";
import { Footer } from "../common/Footer";
import { HousePlug } from "lucide-react";

const LoginPage: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleAuth = () => {
    setLoading(true);
    // Symulacja autentykacji - w rzeczywistości tutaj byłoby przekierowanie do OAuth Google
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode
          ? "bg-zinc-950 text-zinc-50"
          : "bg-gradient-to-b from-emerald-50 to-zinc-100 text-zinc-900"
      }`}
    >
      {/* Tło z elementami energetycznymi */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
          <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M400,0 L400,800 L0,800 C100,600 180,500 250,400 C320,300 350,200 400,0"
              fill={darkMode ? "#059669" : "#10b981"}
            />
          </svg>
        </div>

        {/* Elementy tematyczne - zielona energia */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 1000 1000"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-emerald-600"
            >
              <circle cx="500" cy="500" r="300" />
              <path d="M500 200 L500 800 M300 500 L700 500" />
              <path d="M354 354 L646 646 M646 354 L354 646" />
              <path
                d="M470 250 L530 250 L530 400 L600 400 L450 750 L450 550 L380 550 L470 250"
                fill="currentColor"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Główna zawartość */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10">
        <div
          className={`w-full max-w-md ${
            darkMode
              ? "bg-zinc-900 border-zinc-800"
              : "bg-white border-zinc-200"
          } border rounded-xl shadow-xl overflow-hidden transform transition-all`}
        >
          {/* Nagłówek z logo */}
          <div
            className={`p-8 ${darkMode ? "bg-zinc-900" : "bg-white"} relative`}
          >
            <div className="flex justify-center mb-6 p-10">
              {/* Logo programu dotacji energetycznych */}
              <div className="relative flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-emerald-500 opacity-10 animate-pulse absolute"></div>
                <HousePlug className="w-12 h-12 z-10 relative" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1
                className={`text-3xl font-bold tracking-tight ${
                  darkMode ? "text-white" : "text-zinc-900"
                }`}
              >
                e-operator
              </h1>
              <p
                className={`mt-2 ${
                  darkMode ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Program Dotacji Energetycznych
              </p>
            </div>

            <div
              className={`mx-auto max-w-xs rounded-lg p-2 mb-4 ${
                darkMode ? "bg-zinc-800" : "bg-emerald-50"
              }`}
            >
              <p
                className={`text-center text-sm ${
                  darkMode ? "text-zinc-300" : "text-emerald-800"
                }`}
              >
                Zaloguj się, aby zarządzać swoimi wnioskami i monitorować status
                dotacji
              </p>
            </div>
          </div>

          {/* Sekcja logowania */}
          <div className="px-8 pb-8">
            {/* Przycisk autentykacji Google */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className={`w-full flex items-center justify-center py-3 px-4 rounded-md border text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  darkMode
                    ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                    : "bg-white border-zinc-300 hover:bg-zinc-50 text-zinc-700 shadow-md"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                {loading ? (
                  <svg
                    className="animate-spin mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                {loading ? "Logowanie..." : "Kontynuuj z Google"}
              </button>

              {/* Separator */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className={`w-full border-t ${
                      darkMode ? "border-zinc-800" : "border-zinc-200"
                    }`}
                  ></div>
                </div>
                <div className="relative flex justify-center">
                  <span
                    className={`px-2 text-xs uppercase ${
                      darkMode
                        ? "bg-zinc-900 text-zinc-500"
                        : "bg-white text-zinc-500"
                    }`}
                  >
                    lub
                  </span>
                </div>
              </div>

              {/* Przycisk rejestracji */}
              <button
                onClick={() => navigate("/register")}
                className={`w-full flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white transform hover:scale-105"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transform hover:scale-105"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  darkMode
                    ? "focus:ring-offset-zinc-900"
                    : "focus:ring-offset-white"
                } focus:ring-emerald-500`}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Zarejestruj się
              </button>
            </div>

            {/* Informacja o korzyściach */}
            <div
              className={`mt-8 p-4 rounded-lg ${
                darkMode ? "bg-zinc-800" : "bg-emerald-50"
              }`}
            >
              <h3
                className={`text-sm font-medium mb-2 ${
                  darkMode ? "text-zinc-200" : "text-emerald-800"
                }`}
              >
                Korzyści z uczestnictwa w programie
              </h3>
              <ul
                className={`text-xs space-y-1 ${
                  darkMode ? "text-zinc-400" : "text-emerald-700"
                }`}
              >
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Dofinansowanie do 100% na modernizację energetyczną
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Profesjonalne audyty energetyczne
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Zniżki na ekologiczne źródła energii
                </li>
              </ul>
            </div>
          </div>

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
                href="#"
                className="text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Warunki korzystania
              </a>{" "}
              i{" "}
              <a
                href="#"
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

export default LoginPage;
