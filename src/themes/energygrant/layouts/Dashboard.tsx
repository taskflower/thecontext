// src/themes/energygrant/layouts/Dashboard.tsx
import React, { useMemo, useState } from "react";
import { useFlow } from "@/core";
import { useConfig } from "@/ConfigProvider";
import { I } from "@/components";
import { useParams, useNavigate } from "react-router-dom";
import { useAppNavigation } from "@/core/navigation";
import { ChevronRight } from "lucide-react";
import { useDarkMode } from "../utils/ThemeUtils";
import { Footer } from "../common/Footer";


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
    const classes = `w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors ${
      active
        ? (darkMode ? "bg-green-900 text-green-400 border border-green-800" : "bg-green-50 text-green-700 border border-green-100")
        : (darkMode ? "text-gray-300 hover:bg-gray-800 hover:text-green-400" : "text-gray-700 hover:bg-gray-50 hover:text-green-600")
    }`;
    return (
      <button onClick={() => handleNav(slug)} className={classes}>
        <div className="flex items-center">
          {icon && (
            <I
              name={icon}
              className={`${
                active 
                  ? (darkMode ? "text-green-400" : "text-green-600") 
                  : (darkMode ? "text-gray-500" : "text-gray-400")
              } w-4 h-4`}
            />
          )}
          <span className="ml-3 font-medium">{label}</span>
        </div>
        {active && <ChevronRight className={`h-4 w-4 ${darkMode ? "text-green-400" : "text-green-600"}`} />}
      </button>
    );
  };

  const Navigation = () => (
    <nav className="px-3 py-4 space-y-1 overflow-y-auto">
      <NavButton label="Strona główna" />
      {scenarios.map((s) => (
        <NavButton key={s.slug} slug={s.slug} icon={s.icon} label={s.name} />
      ))}
    </nav>
  );

  if (!workspaceSlug) return null;

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Lewy panel boczny */}
      <aside className={`sticky top-0 h-screen w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-sm hidden md:flex md:flex-col overflow-y-auto`}>
        <header className={`flex-shrink-0 px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-green-700'}`}>
            {context?.workspace?.name ?? "Program Dotacji Energetycznych"}
          </h2>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Panel {userRole}</p>
        </header>
        <div className="flex-grow overflow-y-auto">
          <Navigation />
        </div>
        <footer className={`flex-shrink-0 p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-green-600 bg-gray-800 border-green-800' : 'text-green-700 bg-green-50 border-green-100'} p-3 rounded-lg border`}>
            Potrzebujesz pomocy? Skontaktuj się z operatorem programu.
          </p>
        </footer>
      </aside>

      {/* Główna zawartość */}
      <div className="flex-1 flex flex-col">
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b md:hidden`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-green-700'}`}>
                {context?.workspace?.name ?? "Program Dotacji Energetycznych"}
              </h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Panel {userRole}</p>
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 rounded-md ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'}`}
            >
              <I name={mobileOpen ? "x" : "menu"} />
            </button>
          </div>
          {mobileOpen && <Navigation />}
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
};

export default DashboardLayout;