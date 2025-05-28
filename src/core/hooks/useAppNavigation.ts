// src/core/hooks/useAppNavigation.ts
import { useNavigate, useParams } from "react-router-dom";

type NavParams = {
  config?: string;
  workspace?: string;
  scenario?: string;
  action?: string;
  step?: string;
  id?: string;
};

/**
 * Hook do budowania i nawigacji po ścieżkach aplikacji z placeholderami:
 *  :config, :workspace, :scenario, :action, :step, :id oraz @next, @prev
 *
 * @param slugs - lista slugów kroków w scenariuszu w kolejności
 */
export function useAppNavigation(slugs: string[] = []) {
  const navigate = useNavigate();
  const params = useParams<NavParams>();
  const {
    config = "",
    workspace = "",
    scenario = "",
    action = "",
    step = "",
    id = "",
  } = params;

  // Obliczamy aktualny slug i pozycję w slugs
  const currentSlug = step || action;
  const idx = slugs.findIndex((s) => s === currentSlug);
  const prev = idx > 0 ? slugs[idx - 1] : null;
  const next = idx >= 0 && idx < slugs.length - 1 ? slugs[idx + 1] : null;

  /** Zastępuje placeholdery w szablonie ścieżki */
  function buildPath(template: string): string {
    let path = template
      .replace(/:config/g, config)
      .replace(/:workspace/g, workspace)
      .replace(/:scenario/g, scenario)
      .replace(/:action/g, action)
      .replace(/:step/g, step)
      .replace(/:id/g, id)
      .replace(/@next/g, next ?? "")
      .replace(/@prev/g, prev ?? "");

    // KLUCZOWA POPRAWKA: Jeśli ścieżka nie zaczyna się od config, dodaj go
    if (config && !path.startsWith(`/${config}`)) {
      // Usuń początkowy slash jeśli istnieje
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      path = `/${config}/${cleanPath}`;
    }

    // Usuń duplikaty segmentów workspace (np. /tickets/tickets/...)
    if (workspace) {
      const dupSegment = `/${workspace}/${workspace}/`;
      if (path.includes(dupSegment)) {
        path = path.replace(new RegExp(dupSegment, "g"), `/${workspace}/`);
      }
    }
    
    // Usuń ewentualne podwójne slashe
    path = path.replace(/\/+/g, "/");
    
    // Usuń trailing slash (oprócz root)
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    console.log(`[useAppNavigation] Built path: "${template}" → "${path}"`);
    return path;
  }

  return {
    slugs,
    prev,
    next,
    
    /** Buduje ścieżkę, nie nawigując */
    to: (template: string) => buildPath(template),
    
    /** Nawiguje do wygenerowanej ścieżki */
    go: (template: string) => {
      const fullPath = buildPath(template);
      console.log(`[useAppNavigation] Navigating to: ${fullPath}`);
      navigate(fullPath);
    },
  };
}