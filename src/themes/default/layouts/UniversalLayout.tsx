// src/themes/default/layouts/UniversalLayout.tsx
import { Link, useParams } from "react-router-dom";
import { useConfig } from "@/core";
import type { AppConfig } from "@/core/types";
import UserDropdown from "@/auth/UserDropdown";

export default function UniversalLayout({ children }: any) {
  const { config } = useParams<{ config?: string }>();
  const cfg = config || "exampleTicketApp";

  // dynamiczny odczyt katalogu workspace’ów
  const app = useConfig<AppConfig>(
    cfg,
    `/src/_configs/${cfg}/app.json`
  );
  const workspaces = app?.database?.collections
    ? Object.keys(app.database.collections)
    : [];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col w-full">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <h1 className="text-lg font-medium tracking-tight text-zinc-900">
              {cfg}
            </h1>
            <div className="flex items-center gap-8">
              <nav className="flex items-center gap-1">
                {workspaces.map((ws) => (
                  <Link
                    key={ws}
                    to={`/${cfg}/${ws}`}
                    className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-md transition-colors"
                  >
                    {ws.charAt(0).toUpperCase() + ws.slice(1)}
                  </Link>
                ))}
              </nav>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-12 py-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {children}
        </div>
      </main>

      <footer className="border-t border-zinc-200/50 bg-white/50 mt-16">
        <div className="container mx-auto px-6 py-6 text-center text-xs text-zinc-500 font-medium">
          © {new Date().getFullYear()} {cfg} — Built with Universal Engine + LLM
        </div>
      </footer>
    </div>
  );
}
