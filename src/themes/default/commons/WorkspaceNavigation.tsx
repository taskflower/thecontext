// src/commons/WorkspaceNavigation.tsx
import { Link, useParams, useLocation } from "react-router-dom";
import { useEngineStore } from "@/core";
import { useState, useEffect } from "react";

interface WorkspaceInfo {
  slug: string;
  name: string;
  rolesAllowed?: string[];
}

interface WorkspaceNavigationProps {
  variant?: 'simple' | 'universal';
}

export default function WorkspaceNavigation({ variant = 'simple' }: WorkspaceNavigationProps) {
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

  // Dynamiczne ładowanie wszystkich workspace'ów dla aktualnej konfiguracji
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        setLoading(true);
        
        // Pobierz listę plików workspace'ów dla aktualnej konfiguracji
        // Używamy Vite's import.meta.glob z lazy loading
        const workspaceFiles = import.meta.glob<WorkspaceInfo>(
          "/src/_configs/*/workspaces/*.json",
          { as: "json" }
        );
        
        const workspacePromises = Object.entries(workspaceFiles)
          .filter(([path]) => path.includes(`/${cfg}/workspaces/`))
          .map(async ([path, loader]) => {
            try {
              const workspace = await loader();
              // Wyciągnij slug z nazwy pliku (np. "tickets.json" -> "tickets")
              const slug = path.split('/').pop()?.replace('.json', '') || '';
              return {
                ...workspace,
                slug: workspace.slug || slug
              };
            } catch (error) {
              console.warn(`Failed to load workspace: ${path}`, error);
              return null;
            }
          });
        
        const loadedWorkspaces = (await Promise.all(workspacePromises))
          .filter((ws): ws is WorkspaceInfo => ws !== null);
        
        // Filtruj po rolesAllowed
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

  // Style wariantów
  const getStyles = () => {
    if (variant === 'universal') {
      return {
        container: "flex items-center gap-1",
        loading: "px-3 py-1.5 text-sm text-zinc-400",
        empty: "px-3 py-1.5 text-sm text-zinc-400",
        link: "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
        inactive: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80",
        active: "text-zinc-900 bg-zinc-200/60 font-semibold"
      };
    } else {
      return {
        container: "flex space-x-2",
        loading: "px-3 py-1 text-sm text-gray-400",
        empty: "px-3 py-1 text-sm text-gray-400",
        link: "px-3 py-1 text-sm font-medium rounded transition",
        inactive: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
        active: "text-gray-900 bg-gray-200 font-semibold"
      };
    }
  };

  const styles = getStyles();

  return (
    <nav className={styles.container}>
      {loading ? (
        <div className={styles.loading}>Loading workspaces...</div>
      ) : workspaces.length > 0 ? (
        workspaces.map((ws) => {
          const isActive = isWorkspaceActive(ws.slug);
          return (
            <Link
              key={ws.slug}
              to={`/${cfg}/${ws.slug}`}
              className={`${styles.link} ${isActive ? styles.active : styles.inactive}`}
            >
              {ws.name}
            </Link>
          );
        })
      ) : (
        <div className={styles.empty}>No workspaces available</div>
      )}
    </nav>
  );
}