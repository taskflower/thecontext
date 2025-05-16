// src/editor/components/scenario/NodeEditor.tsx
import React, { useState } from "react";
import { NodeConfig } from "@/core/types";
import { JsonEditor } from "../common/JsonEditor";

interface NodeEditorProps {
  node: NodeConfig;
  onUpdate: (updatedNode: Partial<NodeConfig>) => void;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "attrs" | "schema" | "json"
  >("basic");

  // Dostępne szablony kroków
  const stepTemplates = [
    "FormStep",
    "ApiStep",
    "WidgetsStep",
    "LlmStep",
    "DisplayStep",
    "ConfirmStep",
  ];

  // Obsługa zmiany podstawowych informacji
  const handleBasicChange = (field: string, value: any) => {
    // Upewnij się, że contextSchemaPath i contextDataPath są zawsze dostępne
    if (field === "slug" && !node.contextSchemaPath) {
      onUpdate({
        [field]: value,
        contextSchemaPath: "",
      });
    } else if (field === "slug" && !node.contextDataPath) {
      onUpdate({
        [field]: value,
        contextDataPath: "",
      });
    } else {
      onUpdate({
        [field]: value,
      });
    }
  };
  // Obsługa zmiany atrybutów
  const handleAttrsChange = (updatedAttrs: any) => {
    onUpdate({
      attrs: {
        ...(node.attrs || {}),
        ...updatedAttrs,
      },
    });
  };

  // Obsługa zmiany JSON
  const handleJsonChange = (jsonData: any) => {
    onUpdate(jsonData);
  };

  return (
    <div className="space-y-3">
      {/* Przyciski zmiany zakładki */}
      <div className="flex flex-wrap space-x-1">
        <button
          className={`px-2.5 py-1 text-xs rounded-md ${
            activeTab === "basic"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("basic")}
        >
          Podstawowe
        </button>
        <button
          className={`px-2.5 py-1 text-xs rounded-md ${
            activeTab === "attrs"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("attrs")}
        >
          Atrybuty
        </button>
        <button
          className={`px-2.5 py-1 text-xs rounded-md ${
            activeTab === "schema"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("schema")}
        >
          Schema
        </button>
        <button
          className={`px-2.5 py-1 text-xs rounded-md ${
            activeTab === "json"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("json")}
        >
          JSON
        </button>
      </div>

      {/* Zawartość zakładki */}
      <div>
        {activeTab === "basic" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Etykieta kroku
              </label>
              <input
                type="text"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                value={node.label || ""}
                onChange={(e) => handleBasicChange("label", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Identyfikator kroku (slug)
              </label>
              <input
                type="text"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                value={node.slug || ""}
                onChange={(e) => handleBasicChange("slug", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Opis kroku
              </label>
              <textarea
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                rows={3}
                value={(node.attrs?.description as string) || ""}
                onChange={(e) =>
                  handleBasicChange("attrs", {
                    ...node.attrs,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Szablon kroku
              </label>
              <select
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                value={node.tplFile || ""}
                onChange={(e) => handleBasicChange("tplFile", e.target.value)}
              >
                {stepTemplates.map((tpl) => (
                  <option key={tpl} value={tpl}>
                    {tpl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Katalog szablonu
              </label>
              <input
                type="text"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                value={(node.attrs?.tplDir as string) || ""} // Zmienić na attrs.tplDir
                placeholder="default"
                onChange={(e) =>
                  handleBasicChange("attrs", {
                    ...node.attrs,
                    tplDir: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ścieżka schematu kontekstu
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={node.contextSchemaPath || ""}
                  placeholder="np. website-data"
                  onChange={(e) =>
                    handleBasicChange("contextSchemaPath", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ścieżka danych kontekstu
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={node.contextDataPath || ""}
                  placeholder="np. website-data"
                  onChange={(e) =>
                    handleBasicChange("contextDataPath", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "attrs" && (
          <div className="space-y-3">
            {node.tplFile === "FormStep" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tytuł formularza
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={(node.attrs?.title as string) || ""}
                    onChange={(e) =>
                      handleAttrsChange({ title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Etykieta przycisku
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={(node.attrs?.submitLabel as string) || "Dalej"}
                    onChange={(e) =>
                      handleAttrsChange({ submitLabel: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    JSON Schema (format formularza)
                  </label>
                  <JsonEditor
                    value={node.attrs?.jsonSchema || {}}
                    onChange={(jsonSchema) => handleAttrsChange({ jsonSchema })}
                    height="200px"
                  />
                </div>
              </>
            )}

            {node.tplFile === "ApiStep" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tytuł kroku API
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={(node.attrs?.title as string) || ""}
                    onChange={(e) =>
                      handleAttrsChange({ title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Opis
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={(node.attrs?.description as string) || ""}
                    onChange={(e) =>
                      handleAttrsChange({ description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Endpoint API
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={(node.attrs?.apiEndpoint as string) || ""}
                    onChange={(e) =>
                      handleAttrsChange({ apiEndpoint: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Metoda HTTP
                  </label>
                  <select
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={(node.attrs?.method as string) || "GET"}
                    onChange={(e) =>
                      handleAttrsChange({ method: e.target.value })
                    }
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ścieżka danych ładunku (payloadDataPath)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={(node.attrs?.payloadDataPath as string) || ""}
                    onChange={(e) =>
                      handleAttrsChange({ payloadDataPath: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            {node.tplFile === "WidgetsStep" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tytuł kroku widgetów
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={(node.attrs?.title as string) || ""}
                    onChange={(e) =>
                      handleAttrsChange({ title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Podtytuł
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={(node.attrs?.subtitle as string) || ""}
                    onChange={(e) =>
                      handleAttrsChange({ subtitle: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Widgety
                  </label>
                  <JsonEditor
                    value={node.attrs?.widgets || []}
                    onChange={(widgets) => handleAttrsChange({ widgets })}
                    height="200px"
                  />
                </div>
              </>
            )}

            {node.tplFile === "LlmStep" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tytuł kroku LLM
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={(node.attrs?.title as string) || ""}
                    onChange={(e) =>
                      handleAttrsChange({ title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Automatyczne uruchomienie
                  </label>
                  <div className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={(node.attrs?.autoStart as boolean) || false}
                      onChange={(e) =>
                        handleAttrsChange({ autoStart: e.target.checked })
                      }
                    />
                    <span className="ml-2 text-xs text-gray-700">
                      Uruchom automatycznie
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Wiadomość użytkownika
                  </label>
                  <textarea
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md font-mono"
                    rows={6}
                    value={(node.attrs?.userMessage as string) || ""}
                    onChange={(e) =>
                      handleAttrsChange({ userMessage: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "schema" && (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              Dostępne opcje zapisywania do bazy danych:
            </p>

            <div className="space-y-3">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={!!node.saveToDB?.enabled}
                    onChange={(e) =>
                      onUpdate({
                        saveToDB: {
                          ...(node.saveToDB || {}),
                          enabled: e.target.checked,
                          provider: "indexedDB", // Zawsze ustawiaj domyślną wartość
                          itemType: node.saveToDB?.itemType || "default", // Dodaj domyślną wartość dla itemType
                        },
                      })
                    }
                  />
                  <span className="ml-2 text-xs">Zapisz do bazy danych</span>
                </label>
              </div>

              {node.saveToDB?.enabled && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Provider
                    </label>
                    <select
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      value={node.saveToDB?.provider || "indexedDB"}
                      onChange={() =>
                        onUpdate({
                          saveToDB: {
                            ...(node.saveToDB || {}),
                            enabled: true, // Set explicit value instead of optional
                            provider: "indexedDB",
                            itemType: node.saveToDB?.itemType || "default",
                          },
                        })
                      }
                    >
                      <option value="indexedDB">indexedDB</option>
                      <option value="firebase">firebase</option>
                      <option value="localStorage">localStorage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Typ elementu
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      value={node.saveToDB?.itemType || ""}
                      onChange={(e) =>
                        onUpdate({
                          saveToDB: {
                            ...(node.saveToDB || {}),
                            enabled: true, // Set explicit value instead of optional
                            provider: "indexedDB",
                            itemType: e.target.value || "default",
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tytuł elementu
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      value={node.saveToDB?.itemTitle || ""}
                      onChange={(e) =>
                        onUpdate({
                          saveToDB: {
                            ...(node.saveToDB || {}),
                            enabled: true, // Explicitly set to true instead of optional
                            provider: "indexedDB", // Ensure provider is set
                            itemType: node.saveToDB?.itemType || "default", // Ensure itemType is set
                            itemTitle: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ścieżka zawartości
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      value={node.saveToDB?.contentPath || ""}
                      onChange={(e) =>
                        onUpdate({
                          saveToDB: {
                            ...(node.saveToDB || {}),
                            enabled: true, // Explicitly set to true
                            provider: "indexedDB", // Ensure provider is set
                            itemType: node.saveToDB?.itemType || "default", // Ensure itemType is set
                            contentPath: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "json" && (
          <JsonEditor value={node} onChange={handleJsonChange} />
        )}
      </div>
    </div>
  );
};
