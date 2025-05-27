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

    // Usuń duplikaty ścieżki workspace (np. /tickets/tickets/...)
    const dupSegment = `/${workspace}/${workspace}/`;
    if (workspace && path.includes(dupSegment)) {
      path = path.replace(new RegExp(dupSegment, "g"), `/${workspace}/`);
    }
    
    // Usuń ewentualne podwójne slashe
    return path.replace(/\/\//g, "/");
  }

  return {
    slugs,
    prev,
    next,
  
    /** Buduje ścieżkę, nie nawigując */
    to: (template: string) => buildPath(template),
    /** Nawiązuje do wygenerowanej ścieżki */
    go: (template: string) => navigate(buildPath(template)),
  };
}
