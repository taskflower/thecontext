// Fixed useAppNavigation with proper context processing
import { useNavigate, useParams } from "react-router-dom";
import { useEngineStore } from "./useEngineStore";

type NavParams = {
  config?: string;
  workspace?: string;
  scenario?: string;
  action?: string;
  step?: string;
  id?: string;
};

export function useAppNavigation(slugs: string[] = []) {
  const navigate = useNavigate();
  const params = useParams<NavParams>();
  const { get } = useEngineStore();
  
  const {
    config = "",
    workspace = "",
    scenario = "",
    action = "",
    step = "",
    id = "",
  } = params;

  const currentSlug = step || action;
  const idx = slugs.findIndex((s) => s === currentSlug);
  const prev = idx > 0 ? slugs[idx - 1] : null;
  const next = idx >= 0 && idx < slugs.length - 1 ? slugs[idx + 1] : null;

  /**
   * POPRAWIONA FUNKCJA: Przetwarzanie kontekstu w ścieżkach
   */
  const processContextPlaceholders = (template: string): string => {
    console.log(`[Context] Processing template: "${template}"`);
    
    // Znajdź wszystkie {{...}} w szablonie
    return template.replace(/\{\{([^}]+)\}\}/g, (fullMatch, contextPath) => {
      console.log(`[Context] Found placeholder: "${fullMatch}" with path: "${contextPath}"`);
      
      // Podziel ścieżkę na segmenty (np. "currentUser.role" → ["currentUser", "role"])
      const pathSegments = contextPath.trim().split('.');
      console.log(`[Context] Path segments:`, pathSegments);
      
      // Pobierz wartość z kontekstu
      let value = get(pathSegments[0]); // Pobierz główny obiekt
      console.log(`[Context] Base object "${pathSegments[0]}":`, value);
      
      // Przejdź przez zagnieżdżone właściwości
      for (let i = 1; i < pathSegments.length && value != null; i++) {
        console.log(`[Context] Accessing property "${pathSegments[i]}" on:`, value);
        value = value[pathSegments[i]];
        console.log(`[Context] Result:`, value);
      }
      
      // Zwróć wartość lub pusty string jeśli nie znaleziono
      const result = value != null ? String(value) : "";
      console.log(`[Context] Final resolved value for "${fullMatch}": "${result}"`);
      
      return result;
    });
  };

  /** Zastępuje placeholdery w szablonie ścieżki */
  function buildPath(template: string): string {
    console.log(`[useAppNavigation] Processing template: "${template}"`);
    
    // KROK 1: Przetwórz kontekst {{...}}
    let path = processContextPlaceholders(template);
    console.log(`[useAppNavigation] After context processing: "${path}"`);
    
    // KROK 2: Przetwórz standardowe placeholdery
    path = path
      .replace(/:config/g, config)
      .replace(/:workspace/g, workspace)
      .replace(/:scenario/g, scenario)
      .replace(/:action/g, action)
      .replace(/:step/g, step)
      .replace(/:id/g, id)
      .replace(/@next/g, next ?? "")
      .replace(/@prev/g, prev ?? "");

    console.log(`[useAppNavigation] After standard placeholders: "${path}"`);

    // KROK 3: Jeśli ścieżka nie zaczyna się od config, dodaj go
    if (config && !path.startsWith(`/${config}`)) {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      path = `/${config}/${cleanPath}`;
    }

    console.log(`[useAppNavigation] After adding config: "${path}"`);

    // KROK 4: Usuń duplikaty segmentów workspace
    if (workspace) {
      const dupSegment = `/${workspace}/${workspace}/`;
      if (path.includes(dupSegment)) {
        path = path.replace(new RegExp(dupSegment, "g"), `/${workspace}/`);
      }
    }
    
    // KROK 5: Cleanup
    path = path.replace(/\/+/g, "/");
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    console.log(`[useAppNavigation] Final path: "${template}" → "${path}"`);
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