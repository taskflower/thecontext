import React, { useMemo, useState } from "react";
import { useFlow } from "@/core";
import { useConfig } from "@/ConfigProvider";
import { I } from "@/components";
import { useParams, useNavigate } from "react-router-dom";
import { useAppNavigation } from "@/core/navigation";
import { ChevronRight, HelpCircle, HousePlug } from "lucide-react";
import { useDarkMode } from "../utils/ThemeUtils";
import { Footer } from "../commons/Footer";
import BackgroundDecorator2 from "../commons/BackgroundDecorator2";


interface LayoutContext {
  workspace?: { slug: string; name?: string };
  scenario?: { slug: string };
}

interface Props {
  children: React.ReactNode;
  context?: LayoutContext;
}

const DashboardLayout: React.FC<Props> = ({ children, context }) => {
  const { get } = useFlow();
  const { config, configId } = useConfig();
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { toScenarioStep } = useAppNavigation();
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

  const userRole = useMemo(
    () => get("user-data")?.role ?? "beneficjent",
    [get]
  );
  const [activeScenario, setActiveScenario] = useState<string | null>(
    () => context?.scenario?.slug ?? null
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const scenarios = useMemo(
    () =>
      config?.scenarios.filter((s) => s.workspaceSlug === workspaceSlug) ?? [],
    [config, workspaceSlug]
  );

  const goHome = () => {
    navigate(`/${configId}/${workspaceSlug}`);
    setActiveScenario(null);
    setMobileOpen(false);
  };

  const handleNav = (slug?: string) => {
    if (!workspaceSlug) return;
    if (slug) {
      setActiveScenario(slug);
      toScenarioStep(workspaceSlug, slug, 0);
    } else {
      goHome();
    }
  };

  const NavButton = ({
    slug,
    icon,
    label,
  }: {
    slug?: string;
    icon?: string;
    label: string;
  }) => {
    const active = slug ? slug === activeScenario : !activeScenario;
    const baseClasses = "w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-all duration-200";
    const activeClasses = darkMode
      ? "bg-gradient-to-r from-emerald-800 to-green-900 text-emerald-300 border border-emerald-800 shadow-sm"
      : "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-100 shadow-sm";
    const inactiveClasses = darkMode
      ? "text-gray-300 hover:bg-gray-800/50 hover:text-emerald-400"
      : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600";
    
    const classes = `${baseClasses} ${active ? activeClasses : inactiveClasses}`;
    
    return (
      <button onClick={() => handleNav(slug)} className={classes}>
        <div className="flex items-center">
          {icon && (
            <I
              name={icon}
              className={`${
                active 
                  ? (darkMode ? "text-emerald-300" : "text-emerald-600") 
                  : (darkMode ? "text-gray-500" : "text-gray-400")
              } w-4 h-4`}
            />
          )}
          <span className={`ml-3 ${active ? "font-medium" : ""}`}>{label}</span>
        </div>
        {active && <ChevronRight className={`h-4 w-4 ${darkMode ? "text-emerald-300" : "text-emerald-600"}`} />}
      </button>
    );
  };

  const Navigation = () => (
    <nav className="px-3 py-4 space-y-1.5 overflow-y-auto">
      <NavButton label="Strona główna" />
      {scenarios.map((s) => (
        <NavButton key={s.slug} slug={s.slug} icon={s.icon} label={s.name} />
      ))}
    </nav>
  );

  if (!workspaceSlug) return null;

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-emerald-50 via-zinc-50 to-blue-50 text-gray-900'}`}>
      {/* Użycie komponentu BackgroundDecorator zamiast inline SVG */}
      <BackgroundDecorator2 darkMode={darkMode} />
      
      {/* Lewy panel boczny */}
      <aside className={`sticky top-0 h-screen w-80 ${
        darkMode 
          ? 'bg-gray-800/95 border-gray-700' 
          : 'bg-white/95 border-gray-200'
        } border-r shadow-sm hidden md:flex md:flex-col overflow-y-auto backdrop-blur-sm z-10`}
      >
        <header className={`flex-shrink-0 px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full ${
              darkMode
                ? 'bg-gradient-to-br from-emerald-700 to-green-800'
                : 'bg-gradient-to-br from-emerald-500 to-green-600'
              } flex items-center justify-center mr-3 shadow-sm`}
            >
              <HousePlug className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-emerald-700'}`}>
                {context?.workspace?.name ?? "Program Dotacji"}
              </h2>
              <div className={`text-xs mt-0.5 ${
                darkMode 
                  ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' 
                  : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                } inline-flex items-center px-2 py-0.5 rounded-full border`}
              >
                <span>Panel {userRole}</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-grow overflow-y-auto">
          <Navigation />
        </div>
        
        <footer className={`flex-shrink-0 p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`text-xs ${
            darkMode 
              ? 'text-emerald-300 bg-emerald-900/30 border-emerald-800/50' 
              : 'text-emerald-700 bg-emerald-50 border-emerald-100'
            } p-3 rounded-lg border shadow-sm`}
          >
            <div className="flex items-start">
              <HelpCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
              <p>Potrzebujesz pomocy? Skontaktuj się z operatorem programu.</p>
            </div>
          </div>
        </footer>
      </aside>

      {/* Główna zawartość */}
      <div className="flex-1 flex flex-col relative z-10">
        <header className={`${
          darkMode 
            ? 'bg-gray-800/90 border-gray-700' 
            : 'bg-white/90 border-gray-200'
          } shadow-sm border-b md:hidden backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full ${
                darkMode
                  ? 'bg-gradient-to-br from-emerald-700 to-green-800'
                  : 'bg-gradient-to-br from-emerald-500 to-green-600'
                } flex items-center justify-center mr-3`}
              >
                <HousePlug className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-emerald-700'}`}>
                  {context?.workspace?.name ?? "Program Dotacji"}
                </h2>
                <div className={`text-xs ${
                  darkMode 
                    ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' 
                    : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                  } inline-flex items-center px-2 py-0.5 rounded-full border`}
                >
                  <span>Panel {userRole}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 rounded-md ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-100'
              }`}
            >
              <I name={mobileOpen ? "x" : "menu"} className="w-5 h-5" />
            </button>
          </div>
          {mobileOpen && (
            <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-2`}>
              <Navigation />
            </div>
          )}
        </header>
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
};

export default DashboardLayout;