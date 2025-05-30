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

  function processLink(template: string): string {
    let path = processContextPlaceholders(template);
    
    // Dodaj config jeśli go nie ma
    if (!path.startsWith('/')) {
      path = `/${config}/${path}`;
    } else if (!path.startsWith(`/${config}`)) {
      path = `/${config}${path}`;
    }
    
    path = path.replace(/\/+/g, "/");
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
    
    /** Przetwarza link bez budowania ścieżek */
    to: (template: string) => processLink(template),
    
    /** Nawiguje do przetworzonego linka */
    go: (template: string) => {
      const fullPath = processLink(template);
      console.log(`[Navigation] ${template} → ${fullPath}`);
      navigate(fullPath);
    },
  };
}