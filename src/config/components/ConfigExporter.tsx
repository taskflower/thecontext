// src/components/ConfigExporter.tsx
import React, { useState } from "react";
import config from "../_configs/marketingApp/config"; // Importuj domyślną konfigurację

interface ConfigExporterProps {
  // Opcjonalna własna konfiguracja - jeśli nie podana, użyje domyślnej
  customConfig?: any;
  // Opcjonalny callback po eksporcie
  onExported?: () => void;
  // Opcjonalny styl komponentu
  className?: string;
}

const ConfigExporter: React.FC<ConfigExporterProps> = ({
  customConfig,
  onExported,
  className = "",
}) => {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Funkcja eksportująca konfigurację do pliku
  const exportConfig = () => {
    try {
      setStatus("Eksportowanie konfiguracji...");
      setError(null);

      // Użyj dostarczonej konfiguracji lub domyślnej
      const configToExport = customConfig || config;

      // Przygotuj dane jako ładnie sformatowany JSON
      const jsonConfig = JSON.stringify(configToExport, null, 2);
      const blob = new Blob([jsonConfig], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Utwórz element <a> do pobrania pliku
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.href = url;
      a.download = `app-config-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();

      // Posprzątaj po sobie
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("Konfiguracja została wyeksportowana pomyślnie");
      if (onExported) onExported();
    } catch (err: any) {
      console.error("Błąd podczas eksportowania konfiguracji:", err);
      setError(err.message || "Wystąpił nieznany błąd podczas eksportu");
      setStatus("Eksport nieudany");
    }
  };

  return (
    <div className={`config-exporter ${className}`}>
      <div className="mb-4">
        <button
          onClick={exportConfig}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Eksportuj konfigurację do pliku
        </button>
      </div>

      {status && (
        <div
          className={`mt-2 p-2 rounded ${
            error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {status}
          {error && <div className="mt-1 text-sm">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default ConfigExporter;