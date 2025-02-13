// src/utils/routeHelpers.ts
/**
 * Zwraca nową ścieżkę z podmienionym fragmentem języka.
 * Dla ścieżek admin: /admin/{currentLang}/... -> /admin/{newLang}/...
 * Dla publicznych ścieżek: /{currentLang}/... -> /{newLang}/...
 */
export function getPathWithLanguage(
    pathname: string,
    currentLang: string,
    newLang: string
  ): string {
    if (pathname.startsWith("/admin/")) {
      return pathname.replace(`/admin/${currentLang}`, `/admin/${newLang}`);
    }
    return pathname.replace(`/${currentLang}`, `/${newLang}`);
  }
  