// src/editor/components/workspace/Widget.tsx
import React, { useState } from "react";
import { ChevronUp, ChevronDown, X, Edit, Save, Eye } from "lucide-react";

interface WidgetProps {
  widget: any;
  index: number;
  onUpdate: (updatedWidget: any) => void;
  onDelete: () => void;
}

export const Widget: React.FC<WidgetProps> = ({ 
  widget, 
  index, 
  onUpdate, 
  onDelete 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedWidget, setEditedWidget] = useState(widget);
  
  // Obsługa zmiany pola widgetu
  const handleInputChange = (field: string, value: any) => {
    setEditedWidget((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Zapisz zmiany
  const saveChanges = () => {
    onUpdate(editedWidget);
    setIsEditing(false);
  };
  
  // Anuluj edycję
  const cancelEditing = () => {
    setEditedWidget(widget);
    setIsEditing(false);
  };
  
  // Dostępne szablony widgetów
  const widgetTemplates = [
    "InfoWidget",
    "TitleWidget",
    "ListObjectWidget",
    "ListTableWidget",
    "WidgetWrapperApi",
    "ScenarioListWidget",
    "WorkspacesListWidget"
  ];
  
  // Dostępne wartości colSpan
  const colSpanOptions = [
    { value: 1, label: "1 kolumna" },
    { value: 2, label: "2 kolumny" },
    { value: 3, label: "3 kolumny" },
    { value: "full", label: "Pełna szerokość" }
  ];
  
  // Ikony
  const iconOptions = [
    { value: "info", label: "Informacja" },
    { value: "check", label: "Znacznik" },
    { value: "warning", label: "Ostrzeżenie" },
    { value: "star", label: "Gwiazdka" },
    { value: "briefcase", label: "Teczka" },
    { value: "calculator", label: "Kalkulator" },
    { value: "chart", label: "Wykres" },
    { value: "money", label: "Pieniądze" },
    { value: "document", label: "Dokument" }
  ];
  
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {/* Nagłówek widgetu */}
      <div 
        className={`flex items-center justify-between p-2.5 ${
          isExpanded ? "bg-blue-50 border-b border-gray-200" : "bg-white hover:bg-gray-50"
        } cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <span className="w-5 h-5 bg-gray-100 rounded-full text-xs flex items-center justify-center mr-2">
            {index + 1}
          </span>
          <span className="font-medium text-sm">
            {widget.title || `Widget ${index + 1}`}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            ({widget.tplFile})
          </span>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-400 hover:text-red-600 p-1 mr-1"
            title="Usuń widget"
          >
            <X className="h-4 w-4" />
          </button>
          
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>
      
      {/* Treść widgetu (widoczna po rozwinięciu) */}
      {isExpanded && (
        <div className="p-3 space-y-4">
          {isEditing ? (
            // Formularz edycji
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tytuł
                </label>
                <input 
                  type="text"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={editedWidget.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Szablon widgetu
                </label>
                <select 
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={editedWidget.tplFile || ""}
                  onChange={(e) => handleInputChange("tplFile", e.target.value)}
                >
                  {widgetTemplates.map(tpl => (
                    <option key={tpl} value={tpl}>{tpl}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Szerokość (colSpan)
                </label>
                <select 
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={editedWidget.colSpan || 1}
                  onChange={(e) => {
                    const value = e.target.value === "full" ? "full" : parseInt(e.target.value);
                    handleInputChange("colSpan", value);
                  }}
                >
                  {colSpanOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {editedWidget.tplFile === "InfoWidget" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ikona
                    </label>
                    <select 
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      value={editedWidget.icon || "info"}
                      onChange={(e) => handleInputChange("icon", e.target.value)}
                    >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Dane
                    </label>
                    <textarea 
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      rows={3}
                      value={editedWidget.data || ""}
                      onChange={(e) => handleInputChange("data", e.target.value)}
                    />
                  </div>
                </>
              )}
              
              {(editedWidget.tplFile === "ListObjectWidget" || 
                editedWidget.tplFile === "ListTableWidget" ||
                editedWidget.tplFile === "InfoWidget") && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ścieżka danych (contextDataPath)
                  </label>
                  <input 
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={editedWidget.contextDataPath || ""}
                    onChange={(e) => handleInputChange("contextDataPath", e.target.value)}
                    placeholder="np. website-data.url"
                  />
                </div>
              )}
              
              {editedWidget.tplFile === "WidgetWrapperApi" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Endpoint API
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      value={editedWidget.apiEndpoint || ""}
                      onChange={(e) => handleInputChange("apiEndpoint", e.target.value)}
                      placeholder="/api/v1/..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Metoda HTTP
                    </label>
                    <select 
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      value={editedWidget.method || "GET"}
                      onChange={(e) => handleInputChange("method", e.target.value)}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ścieżka odpowiedzi (responseDataPath)
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      value={editedWidget.responseDataPath || ""}
                      onChange={(e) => handleInputChange("responseDataPath", e.target.value)}
                      placeholder="np. data.items"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Widget docelowy
                    </label>
                    <select 
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      value={editedWidget.widget || ""}
                      onChange={(e) => handleInputChange("widget", e.target.value)}
                    >
                      <option value="">Wybierz widget</option>
                      <option value="ListObjectWidget">ListObjectWidget</option>
                      <option value="ListTableWidget">ListTableWidget</option>
                    </select>
                  </div>
                </>
              )}
              
              <div className="flex space-x-2 pt-2">
                <button
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                  onClick={saveChanges}
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Zapisz
                </button>
                <button
                  className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200"
                  onClick={cancelEditing}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            // Podgląd widgetu
            <div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-gray-50 p-2 rounded-md">
                  <span className="text-gray-500">Szablon:</span>{" "}
                  <span className="font-mono">{widget.tplFile}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-md">
                  <span className="text-gray-500">Szerokość:</span>{" "}
                  <span className="font-mono">{widget.colSpan || 1}</span>
                </div>
                
                {widget.icon && (
                  <div className="bg-gray-50 p-2 rounded-md">
                    <span className="text-gray-500">Ikona:</span>{" "}
                    <span className="font-mono">{widget.icon}</span>
                  </div>
                )}
                
                {widget.contextDataPath && (
                  <div className="bg-gray-50 p-2 rounded-md">
                    <span className="text-gray-500">Ścieżka danych:</span>{" "}
                    <span className="font-mono">{widget.contextDataPath}</span>
                  </div>
                )}
                
                {widget.apiEndpoint && (
                  <div className="bg-gray-50 p-2 rounded-md">
                    <span className="text-gray-500">Endpoint API:</span>{" "}
                    <span className="font-mono">{widget.apiEndpoint}</span>
                  </div>
                )}
              </div>
              
              {widget.data && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Dane:</p>
                  <div className="bg-gray-50 p-2 rounded-md text-xs font-mono">
                    {widget.data}
                  </div>
                </div>
              )}
              
              <button
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edytuj
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};