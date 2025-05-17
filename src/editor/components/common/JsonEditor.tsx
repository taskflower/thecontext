// src/editor/components/common/JsonEditor.tsx
import React, { useState, useEffect } from "react";

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  height?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  height = "300px",
}) => {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Konwertuj wartość na tekst JSON
  useEffect(() => {
    try {
      setJsonText(JSON.stringify(value, null, 2));
      setError(null);
    } catch (err: any) {
      setError(`Błąd parsowania JSON: ${err.message}`);
    }
  }, [value]);

  // Aktualizuj JSON
  const updateJson = (text: string) => {
    setJsonText(text);

    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setError(null);
    } catch (err: any) {
      setError(`Błąd parsowania JSON: ${err.message}`);
      // Nie wywołujemy onChange gdy JSON jest niepoprawny
    }
  };

  return (
    <>
      <textarea
        className={`w-full px-3 py-1.5 text-sm  rounded-md font-mono ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        }`}
        style={{ height }}
        value={jsonText}
        onChange={(e) => updateJson(e.target.value)}
        spellCheck={false}
      />

      {error && <div className="text-xs text-red-600">{error}</div>}
    </>
  );
};
