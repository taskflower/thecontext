// src/commons/WorkspaceNavigation.tsx - Jeden wariant
import { Link, useParams, useLocation } from "react-router-dom";
import { useEngineStore } from "@/core";
import { useState, useEffect } from "react";

interface WorkspaceInfo {
  slug: string;
  name: string;
  rolesAllowed?: string[];
  icon?: string;
  color?: string;
}

export default function WorkspaceNavigation() {
  const { config } = useParams<{ config?: string; workspace?: string }>();
  const location = useLocation();
  const cfg = config || "exampleTicketApp";

  const { get } = useEngineStore();
  const currentRole = get("currentUser.role");

  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Sprawdź czy dany workspace jest aktywny
  const isWorkspaceActive = (workspaceSlug: string) => {
    return location.pathname.includes(`/${cfg}/${workspaceSlug}`);
  };

  // Dynamiczne ładowanie wszystkich workspace'ów
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        setLoading(true);

        const workspaceFiles = import.meta.glob<WorkspaceInfo>(
          "/src/_configs/*/workspaces/*.json",
          { as: "json" }
        );

        const workspacePromises = Object.entries(workspaceFiles)
          .filter(([path]) => path.includes(`/${cfg}/workspaces/`))
          .map(async ([path, loader]) => {
            try {
              const workspace = await loader();
              const slug = path.split("/").pop()?.replace(".json", "") || "";

              // Ensure all required properties are defined
              return {
                slug: workspace.slug || slug,
                name: workspace.name,
                rolesAllowed: workspace.rolesAllowed,
                icon: workspace.icon,
                color: workspace.color,
              } as WorkspaceInfo;
            } catch (error) {
              console.warn(`Failed to load workspace: ${path}`, error);
              return null;
            }
          });

        const loadedWorkspaces = (await Promise.all(workspacePromises)).filter(
          (ws): ws is WorkspaceInfo => ws !== null
        );

        const visibleWorkspaces = loadedWorkspaces.filter(
          (ws) => !ws.rolesAllowed || ws.rolesAllowed.includes(currentRole)
        );

        setWorkspaces(visibleWorkspaces);
      } catch (error) {
        console.error("Failed to load workspaces:", error);
        setWorkspaces([]);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaces();
  }, [cfg, currentRole]);

  return (
    <nav className="flex items-center space-x-1">
      {loading ? (
        <div className="text-sm text-slate-400 px-3 py-2">Loading...</div>
      ) : workspaces.length > 0 ? (
        workspaces.map((ws) => {
          const isActive = isWorkspaceActive(ws.slug);
          return (
            <Link
              key={ws.slug}
              to={`/${cfg}/${ws.slug}`}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }
              `}
            >
              <span className="text-xs">{ws.icon}</span>
              <span>{ws.name}</span>
            </Link>
          );
        })
      ) : (
        <div className="text-sm text-slate-400 px-3 py-2">No workspaces</div>
      )}
    </nav>
  );
}