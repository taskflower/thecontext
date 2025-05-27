// src/themes/default/layouts/Simple.tsx

import UserDropdown from "@/auth/UserDropdown"; // Przywrócono import UserDropdown
import { Link, useParams } from "react-router-dom";
import { useConfig, WorkspaceConfig } from "@/core"; // Używamy hooka useConfig

export default function Simple({ children }: any) {
  const { config } = useParams();
  const cfg = config || "exampleTicketApp";

  // Pobieramy konfigurację workspace'ów za pomocą useConfig
  const workspaceConfig = useConfig(
    "appConfig",
    `/src/_configs/${cfg}/workspaces.json`
  );

  // Zmieniamy typowanie na tablicę stringów, aby można było używać .map()
  const workspaces: string[] = workspaceConfig?.workspaces || ["main", "tickets"];

  const currentConfigLabel = cfg || "exampleTicketApp";

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col w-full">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              <h1 className="text-lg font-medium tracking-tight text-zinc-900">
                {currentConfigLabel}
              </h1>
            </div>
            <div className="flex items-center gap-8">
              {/* Navigation do workspace'ów */}
              <nav className="flex items-center gap-1">
                {workspaces.map((workspace) => (
                  <Link
                    key={workspace}
                    to={`/${cfg}/${workspace}`}
                    className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-md transition-colors"
                  >
                    {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
                  </Link>
                ))}
              </nav>

              {/* Przywrócono przycisk logowania */}
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
            © {new Date().getFullYear()} {currentConfigLabel} — Built with
            Universal Engine + LLM
          </p>
        </div>
      </footer>
    </div>
  );
}
