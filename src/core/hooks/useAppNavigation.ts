// src/core/hooks/useAppNavigation.ts - SLASH VERSION
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
    return template.replace(/\{\{([^}]+)\}\}/g, (match, contextPath) => {
      // Używaj drugiego parametru (captured group)
      const pathSegments = contextPath.trim().split(".");
      let value = get(pathSegments[0]);
  
      for (let i = 1; i < pathSegments.length && value != null; i++) {
        value = value[pathSegments[i]];
      }
  
      return value != null ? String(value) : match; // Zwróć oryginalny match jeśli nie znaleziono
    });
  };

  /**
   * Buduje pełny URL z config
   *
   * WAŻNE: Komponenty podają URL z / na początku: "/workspace/scenario/node"
   * Taki zapis od razu informuje że to jest URL!
   * Config dodawany automatycznie: "/admin/list/view" → "/roleTestApp/admin/list/view"
   */
  function buildFullPath(template: string): string {
    const processedPath = processContextPlaceholders(template);

    // Usuń / z początku i dodaj config
    const cleanPath = processedPath.startsWith("/")
      ? processedPath.slice(1)
      : processedPath;
    return `/${config}/${cleanPath}`;
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

    /** Buduje pełną ścieżkę z config */
    to: (template: string) => buildFullPath(template),

    /** Nawiguje - template z / na początku, config dodawany automatycznie */
    go: (template: string) => {
      const fullPath = buildFullPath(template);
      console.log(`[Navigation] ${template} → ${fullPath}`);
      navigate(fullPath);
    },
  };
}
