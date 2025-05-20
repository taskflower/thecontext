import { useAuthContext } from "@/auth/AuthContext";
import { ArrowRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFlow } from "@/core";

type LoginWidgetProps = {
  onSubmit: () => void; // Funkcja, którą wywołasz po udanym logowaniu
  title?: string; // Opcjonalny tytuł widgetu
  config: any; // Konfiguracja aplikacji
  workspaceSlug: string; // Slug aktualnego workspace
  scenarioSlug: string; // Slug aktualnego scenariusza
  successPath?: string; // Ścieżka nawigacji po zalogowaniu
  successLabel?: string; // Tekst na przycisku (domyślnie "Przejdź dalej")
  dataPath?: string; // Ścieżka do zapisania danych użytkownika w kontekście
};

/**
 * Mechanizm nawigacji po ścieżce successPath
 *
 * @param successPath - Ścieżka nawigacji (opcjonalnie z interpolacją zmiennych {{data.path}})
 * @param configId - ID konfiguracji (potrzebne do konstruowania pełnej ścieżki)
 * @param defaultPath - Domyślna ścieżka, gdy successPath nie jest podany
 * @param get - Funkcja do pobierania wartości z kontekstu aplikacji
 * @returns Pełna ścieżka nawigacji
 */
const buildNavigationPath = (
  successPath: string | undefined,
  configId: string,
  defaultPath: string,
  get: (path: string) => any
): string => {
  // Jeśli nie podano ścieżki, użyj domyślnej
  if (!successPath) {
    return defaultPath;
  }

  // Przetwórz ścieżkę, zastępując zmienne {{data.path}} wartościami z kontekstu
  let processedPath = successPath.replace(/{{([^}]+)}}/g, (_, dataPath) => {
    const value = get(dataPath.trim());
    return value !== undefined ? String(value) : "";
  });

  // Jeśli ścieżka nie zaczyna się od "/", dodaj prefix z configId
  if (!processedPath.startsWith("/")) {
    processedPath = `/${configId}/${processedPath}`;
  }

  return processedPath;
};

export default function LoginWidget({
  onSubmit,
  title = "",
  config,
  workspaceSlug,
  scenarioSlug,
  successPath,
  successLabel = "Przejdź dalej",
  dataPath = "user-data", // Domyślna ścieżka kontekstu
}: LoginWidgetProps) {
  const { loading, signInWithGoogle, signOut, user } = useAuthContext();
  const navigate = useNavigate();
  const params = useParams();
  const { get, set } = useFlow(); // Dodano dostęp do funkcji set

  // Pobierz currentStep z parametrów URL lub ustaw na 0
  const currentStep = params.stepIndex ? parseInt(params.stepIndex, 10) : 0;
  const configId = params.configId || config.name;

  // Funkcja zapisująca dane użytkownika Google do kontekstu aplikacji
  const saveUserDataToContext = () => {
    if (user) {
      // Zapisz email użytkownika
      if (dataPath) {
        set(`${dataPath}.email`, user.email);
        set(`${dataPath}.id`, user.uid);
        set(`${dataPath}.isLoggedIn`, true);
        set(`${dataPath}.lastLoginDate`, new Date().toISOString());

        // Jeśli dostępne, zapisz również imię i nazwisko
        if (user.displayName) {
          const nameParts = user.displayName.split(" ");
          if (nameParts.length > 0) {
            set(`${dataPath}.firstName`, nameParts[0]);
            if (nameParts.length > 1) {
              set(`${dataPath}.lastName`, nameParts.slice(1).join(" "));
            }
          }
        }
      }

      console.log("Zapisano dane użytkownika do kontekstu:", {
        path: dataPath,
        email: user.email,
        id: user.uid,
        isLoggedIn: true,
        lastLoginDate: new Date().toISOString(),
      });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      // Po udanym logowaniu, zapisz dane użytkownika do kontekstu
      saveUserDataToContext();
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  // Funkcja do obsługi wylogowania
  const handleLogout = async () => {
    try {
      await signOut();
      console.log("Wylogowano pomyślnie");

      // Po wylogowaniu aktualizujemy status w kontekście
      if (dataPath) {
        set(`${dataPath}.isLoggedIn`, false);
      }

      // Opcjonalnie: możesz dodać nawigację po wylogowaniu, np. do strony głównej
      // navigate("/");
    } catch (error) {
      console.error("Wylogowanie nie powiodło się", error);
    }
  };

  // Funkcja do przejścia do następnego kroku
  const handleContinue = () => {
    // Upewnij się, że dane użytkownika są zapisane w kontekście
    saveUserDataToContext();

    // Następnie wywołujemy standardowy onSubmit dla zachowania kompatybilności
    if (typeof onSubmit === "function") {
      console.log("Calling onSubmit function");
      onSubmit();
    }

    // Domyślna ścieżka to przejście do następnego kroku
    const defaultPath = `/${configId}/${workspaceSlug}/${scenarioSlug}/${
      currentStep + 1
    }`;

    // Zbuduj ścieżkę nawigacji
    const navigationPath = buildNavigationPath(
      successPath,
      configId,
      defaultPath,
      get
    );

    console.log("Navigation debug:", {
      navigationPath,
      successPath,
      defaultPath,
      processedPath: successPath
        ? buildNavigationPath(successPath, configId, "", get)
        : "",
      configId,
      workspaceSlug,
      scenarioSlug,
      currentStep,
    });

    // Wykonujemy nawigację
    if (navigationPath) {
      navigate(navigationPath);
    } else {
      console.warn("Navigation failed. Could not determine navigation path.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Tytuł widgetu */}
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
      )}

      {/* Informacja o logowaniu lub powitanie */}
      <div
        className={`mx-auto max-w-md rounded-lg p-3 mb-4 ${
          user ? "bg-emerald-50" : "bg-emerald-50"
        }`}
      >
        <p
          className={`text-center text-sm ${
            user ? "text-emerald-800" : "text-emerald-800"
          }`}
        >
          {user
            ? `Witaj, ${
                user.displayName || user.email
              }! Możesz teraz przejść dalej.`
            : "Zaloguj się, aby zarządzać swoimi wnioskami i monitorować status dotacji"}
        </p>
      </div>

      {/* Pokaż różne przyciski w zależności od stanu zalogowania */}
      {!user ? (
        <>
          {/* Przycisk autentykacji Google - widoczny tylko gdy użytkownik nie jest zalogowany */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 rounded-md border text-sm font-medium 
                    bg-white border-zinc-300 hover:bg-zinc-50 text-zinc-700 shadow-md
                    focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {loading ? (
              <svg
                className="animate-spin mr-2 h-4 w-4 text-zinc-700"
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

          {/* Separator - widoczny tylko gdy użytkownik nie jest zalogowany */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 text-xs uppercase bg-white text-zinc-500">
                lub
              </span>
            </div>
          </div>

          {/* Przycisk rejestracji - widoczny tylko gdy użytkownik nie jest zalogowany */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium 
                    bg-emerald-600 hover:bg-emerald-700 text-white shadow-md
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
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
        </>
      ) : (
        /* Kontener dla przycisków gdy użytkownik jest zalogowany */
        <div className="flex flex-col space-y-3">
          {/* Przycisk przejścia dalej - widoczny tylko gdy użytkownik jest zalogowany */}
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium 
                    bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            {successLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>

          {/* Przycisk wylogowania - widoczny tylko gdy użytkownik jest zalogowany */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium 
                    border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Wyloguj się
          </button>
        </div>
      )}
    </div>
  );
}
