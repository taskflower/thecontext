// src/core/hooks/useAppNavigation.ts - SIMPLIFIED VERSION
import { useNavigate, useParams } from "react-router-dom";
import { useEngineStore } from "./useEngineStore";

type NavParams = {
  config?: string;
  workspace?: string;
  scenario?: string;
  node?: string;
  id?: string;
};

export function useAppNavigation() {
  const navigate = useNavigate();
  const params = useParams<NavParams>();
  const { get } = useEngineStore();
  
  const {
    config = "",
    workspace = "",
    scenario = "",
    node = "",
    id = "",
  } = params;

  /**
   * Zastępuje placeholdery kontekstu {{...}} wartościami z store
   */
  const processContextPlaceholders = (template: string): string => {
    return template.replace(/\{\{([^}]+)\}\}/g, (fullMatch, contextPath) => {
      const pathSegments = contextPath.trim().split('.');
      let value = get(pathSegments[0]);
      
      for (let i = 1; i < pathSegments.length && value != null; i++) {
        value = value[pathSegments[i]];
      }
      
      return value != null ? String(value) : "";
    });
  };

  /**
   * Buduje ścieżkę na podstawie szablonu
   * Obsługuje formaty:
   * - "workspace/scenario/node" -> "/config/workspace/scenario/node"
   * - "/config/workspace/scenario/node" -> "/config/workspace/scenario/node"
   * - "workspace" -> "/config/workspace"
   */
  function buildPath(template: string): string {
    // Przetwórz kontekst {{...}}
    let path = processContextPlaceholders(template);
    
    // Zastąp standardowe placeholdery
    path = path
      .replace(/:config/g, config)
      .replace(/:workspace/g, workspace)
      .replace(/:scenario/g, scenario)
      .replace(/:node/g, node)
      .replace(/:id/g, id);

    // Jeśli ścieżka nie zaczyna się od /, dodaj config na początku
    if (!path.startsWith('/')) {
      path = `/${config}/${path}`;
    }

    // Cleanup - usuń podwójne slashe
    path = path.replace(/\/+/g, "/");
    
    // Usuń trailing slash (oprócz root)
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    return path;
  }

  return {
    /** Aktualny config */
    config,
    /** Aktualny workspace */
    workspace,
    /** Aktualny scenario */
    scenario,
    /** Aktualny node */
    node,
    /** Aktualny id (dla edycji) */
    id,
    
    /** Buduje ścieżkę bez nawigacji */
    to: (template: string) => buildPath(template),
    
    /** Nawiguje do wygenerowanej ścieżki */
    go: (template: string) => {
      const fullPath = buildPath(template);
      console.log(`[Navigation] ${template} → ${fullPath}`);
      navigate(fullPath);
    },
  };
}