import { useAppNavigation } from "@/engine";
import { useAppScenarios } from "@/engine/hooks/useAppScenarios";
import { useMockAuth } from "../useMockAuth";
import { useDarkMode } from "../utils/ThemeUtils";
import BackgroundDecorator from "../components/BackgroundDecorator";
import { Footer } from "../components/Footer";


export default function Simple({ children }: { children: React.ReactNode }) {
  const { config, workspace, scenario, navigateTo } = useAppNavigation();
  const { scenarios, loading } = useAppScenarios(config, workspace);
  const { user, logout } = useMockAuth();
  const { darkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <BackgroundDecorator darkMode={darkMode} />
      
      <div className="flex h-screen relative">
        {/* Sidebar */}
        <div className="w-64 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-r border-slate-200/50 dark:border-slate-700/50 p-4">
          {/* User info */}
          {user && (
            <div className="mb-4 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="text-sm text-slate-600 dark:text-slate-400">Zalogowany jako:</div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
              <button
                onClick={logout}
                className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 mt-1 transition-colors"
              >
                Wyloguj
              </button>
            </div>
          )}

          <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">Scenariusze</h3>
          {loading ? (
            <div className="text-slate-500 dark:text-slate-400">...</div>
          ) : (
            <ul className="space-y-2">
              {scenarios.map((scenarioSlug) => (
                <li key={scenarioSlug}>
                  <button
                    onClick={() => navigateTo(`${workspace}/${scenarioSlug}`)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                      scenario === scenarioSlug
                        ? "bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {scenarioSlug}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Quick navigation */}
          {user && (
            <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <h4 className="font-medium text-sm mb-2 text-slate-900 dark:text-slate-100">Szybki dostęp</h4>
              <button
                onClick={() => navigateTo("tickets/list")}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-100/60 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Lista zgłoszeń
              </button>
              <button
                onClick={() => navigateTo("users/profile")}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-100/60 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Mój profil
              </button>
            </div>
          )}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      
      <Footer darkMode={false} />
    </div>
  );
}