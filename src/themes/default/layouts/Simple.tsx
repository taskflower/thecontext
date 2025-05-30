// src/themes/default/layouts/Simple.tsx
import { Link, useParams } from "react-router-dom";
import { useEngineStore } from "@/core";
import UserDropdown from "@/auth/UserDropdown";

// 1) Globujemy *wszystkie* pliki workspace’ów jako JSON
const workspaceModules = import.meta.glob<{
  slug: string;
  name: string;
  rolesAllowed?: string[];
}>("/src/_configs/*/workspaces/*.json", { eager: true, as: "json" });

export default function Simple({ children }: any) {
  // 2) Hooki NA GÓRZE
  const { config } = useParams<{ config?: string }>();
  const cfg = config || "roleTestApp";

  const { get } = useEngineStore();
  const currentRole = get("currentUser.role");

  // 3) Filtrowanie: wybierz tylko workspace’y z bieżącego configu
  const allWorkspaces = Object.entries(workspaceModules)
    .filter(([file]) => file.includes(`/${cfg}/workspaces/`))
    .map(([, mod]) => mod);

  // 4) Dodatkowe filtrowanie po rolesAllowed
  const visible = allWorkspaces.filter(
    (ws) => !ws.rolesAllowed || ws.rolesAllowed.includes(currentRole)
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 bg-white border-b z-10">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">{cfg}</h1>
          <nav className="flex space-x-2">
            {visible.map((ws) => (
              <Link
                key={ws.slug}
                to={`/${cfg}/${ws.slug}`}
                className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
              >
                {ws.name}
              </Link>
            ))}
          </nav>
          <UserDropdown />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="bg-white border-t">
        <div className="container mx-auto px-6 py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {cfg}
        </div>
      </footer>
    </div>
  );
}
