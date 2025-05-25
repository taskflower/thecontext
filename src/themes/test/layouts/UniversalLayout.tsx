// src/themes/test/layouts/UniversalLayout.tsx
import UserDropdown from "@/auth/UserDropdown";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function UniversalLayout({ children }: any) {
  const { config } = useParams();
  const navigate = useNavigate();
  const currentConfig = config || "exampleTicketApp";

  // Lista dostępnych konfigów - można to potem wyciągnąć do hooka
  const availableConfigs = [
    { value: "exampleTicketApp", label: "🎫 Ticket App" },
    { value: "universalEngineConfig", label: "⚙️ Config Editor" },
    // { value: "myShopApp", label: "🛒 Shop App" }, // przykład przyszłych aplikacji
  ];

  // Lista workspace'ów dla aktualnego configa - można to też dynamicznie ładować
  const getWorkspacesForConfig = (configName: string) => {
    switch (configName) {
      case "exampleTicketApp":
        return ["main", "tickets"];
      case "universalEngineConfig":
        return ["workspaces"];
      default:
        return ["main"];
    }
  };

  const workspaces = getWorkspacesForConfig(currentConfig);

  const handleConfigChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newConfig = e.target.value;
    const defaultWorkspace = getWorkspacesForConfig(newConfig)[0];
    navigate(`/${newConfig}/${defaultWorkspace}`);
  };

  const currentConfigLabel = availableConfigs.find(c => c.value === currentConfig)?.label || currentConfig;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col w-full">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium tracking-tight text-zinc-900">
                Universal Engine
              </h1>
              
              {/* Config Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">App:</span>
                <select
                  value={currentConfig}
                  onChange={handleConfigChange}
                  className="text-sm border border-zinc-300/80 rounded-md px-2 py-1 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400"
                >
                  {availableConfigs.map((cfg) => (
                    <option key={cfg.value} value={cfg.value}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              {/* Workspace Navigation */}
              <nav className="flex items-center gap-1">
                {workspaces.map((workspace) => (
                  <Link
                    key={workspace}
                    to={`/${currentConfig}/${workspace}`}
                    className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-md transition-colors"
                  >
                    {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
                  </Link>
                ))}
              </nav>
              
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-12 py-8">
        <div className="container mx-auto">{children}</div>
      </main>
      
      <footer className="border-t border-zinc-200/50 bg-white/50 mt-16">
        <div className="container mx-auto px-6 py-6">
          <p className="text-center text-xs text-zinc-500 font-medium">
            © {new Date().getFullYear()} {currentConfigLabel} — Built with Universal Engine + LLM
          </p>
        </div>
      </footer>
    </div>
  );
}