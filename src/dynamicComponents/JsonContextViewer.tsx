/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { PluginComponentWithSchema } from "../modules/plugins/types";
import { useAppStore } from "../modules/store";

// Define the data structure for JsonContextViewer
interface JsonContextViewerData {
  contextKey: string;
  title?: string;
  showTitle?: boolean;
}

/**
 * Plugin do wyświetlania kontekstu JSON w formie pól formularza
 * Wyświetla tylko pierwszy poziom kluczy i wartości (string lub number)
 */
const JsonContextViewer: PluginComponentWithSchema<JsonContextViewerData> = ({
  data,
  appContext,
}) => {
  // Wartości domyślne dla konfiguracji pluginu
  const defaultOptions = {
    contextKey: "",
    title: "Dane JSON",
    showTitle: true,
  };

  // Połączenie dostarczonych danych z domyślnymi
  const options: JsonContextViewerData = {
    ...defaultOptions,
    ...(data as JsonContextViewerData),
  };

  // Stan do przechowywania sparsowanych danych JSON
  const [parsedData, setParsedData] = useState<Record<string, string | number> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie danych kontekstu
  useEffect(() => {
    if (!options.contextKey) {
      setError("Nie podano klucza kontekstu");
      return;
    }

    try {
      // Pobierz wszystkie elementy kontekstu
      const contextItems = useAppStore.getState().getContextItems();
      
      // Znajdź element kontekstu o podanym kluczu
      const contextItem = contextItems.find(item => item.title === options.contextKey);
      
      if (!contextItem) {
        setError(`Nie znaleziono kontekstu o kluczu: ${options.contextKey}`);
        return;
      }

      let jsonData: Record<string, any>;
      
      // Próba parsowania zawartości kontekstu jako JSON
      try {
        jsonData = typeof contextItem.content === 'string' 
          ? JSON.parse(contextItem.content) 
          : contextItem.content;
      } catch {
        setError(`Zawartość kontekstu ${options.contextKey} nie jest poprawnym JSON`);
        return;
      }
      
      // Filtrujemy tylko pierwszy poziom i tylko wartości string lub number
      const filteredData: Record<string, string | number> = {};
      
      Object.entries(jsonData).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          filteredData[key] = value;
        }
      });
      
      setParsedData(filteredData);
      setError(null);
    } catch (e) {
      console.error("Błąd podczas pobierania kontekstu:", e);
      setError("Wystąpił błąd podczas pobierania kontekstu");
    }
  }, [options.contextKey]);

  // Renderowanie pluginu
  return (
    <div className="mt-4 space-y-4">
      {/* Tytuł pluginu */}
      {options.showTitle && options.title && (
        <h3 className="text-lg font-medium leading-6">{options.title}</h3>
      )}

      {/* Obsługa błędów */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 border border-red-200">
          <p>{error}</p>
        </div>
      )}

      {/* Wyświetlanie danych JSON */}
      {parsedData && Object.keys(parsedData).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(parsedData).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {key}
              </label>
              <div className="rounded-md bg-muted p-3 text-foreground">
                {String(value)}
              </div>
            </div>
          ))}
        </div>
      ) : !error ? (
        <div className="rounded-md bg-primary/5 p-4 text-sm">
          <p>Brak danych do wyświetlenia</p>
        </div>
      ) : null}
    </div>
  );
};

// Ustawienia pluginu
JsonContextViewer.pluginSettings = {
  // Plugin nie zastępuje żadnych standardowych elementów
};

// Schemat konfiguracji pluginu
JsonContextViewer.optionsSchema = {
  contextKey: {
    type: "string",
    label: "Klucz kontekstu",
    default: "",
    description: "Tytuł elementu kontekstowego zawierającego dane JSON",
  },
  title: {
    type: "string",
    label: "Tytuł",
    default: "Dane JSON",
    description: "Tytuł sekcji z danymi JSON",
  },
  showTitle: {
    type: "boolean",
    label: "Pokaż tytuł",
    default: true,
    description: "Czy pokazywać tytuł sekcji",
  },
};

export default JsonContextViewer;