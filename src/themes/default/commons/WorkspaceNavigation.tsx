// src/commons/WorkspaceNavigation.tsx - Modern Dropbox Style
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

interface WorkspaceNavigationProps {
  variant?: "simple" | "universal";
}

export default function WorkspaceNavigation({
  variant = "simple",
}: WorkspaceNavigationProps) {
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

  if (variant === "universal") {
    return (
      <nav className="flex items-center space-x-1">
        {loading ? (
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-20 bg-slate-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : workspaces.length > 0 ? (
          workspaces.map((ws) => {
            const isActive = isWorkspaceActive(ws.slug);
            return (
              <Link
                key={ws.slug}
                to={`/${cfg}/${ws.slug}`}
                className={`
                  group relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-white shadow-lg shadow-slate-200/50 text-slate-900 border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }
                `}
              >
                <div
                  className={`
                  w-6 h-6 rounded-lg bg-gradient-to-r ${
                    ws.color
                  } flex items-center justify-center text-white text-xs
                  ${isActive ? "shadow-sm" : "group-hover:shadow-sm"}
                  transition-all duration-200
                `}
                >
                  {ws.icon}
                </div>
                <span className="whitespace-nowrap">{ws.name}</span>

                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
                )}
              </Link>
            );
          })
        ) : (
          <div className="text-sm text-slate-500 px-4 py-2">
            No workspaces available
          </div>
        )}
      </nav>
    );
  }

  // Simple variant
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
