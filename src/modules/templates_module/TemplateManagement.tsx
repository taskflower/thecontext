// src/modules/templates_module/TemplateManagement.tsx
import React, { useState } from 'react';

import { useTemplateStore } from './templateStore';
import { useScenarioStore } from '../scenarios_module/scenarioStore';


const TemplateManagement: React.FC = () => {
  const { nodes, edges } = useScenarioStore();
  const { templates, addTemplate, importTemplateAsNode } = useTemplateStore();
  
  // State for various modals and forms
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSaveTemplateForm, setShowSaveTemplateForm] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<string>('');
  const [mountPoint, setMountPoint] = useState('');
  const [prefix, setPrefix] = useState('');
  const [templateForm, setTemplateForm] = useState({ name: '', description: '' });

  // Handle importing a template
  const handleImportTemplate = () => {
    const index = parseInt(selectedTemplateIndex);
    if (!isNaN(index) && templates[index] && mountPoint) {
      importTemplateAsNode(index, mountPoint, prefix || 'imported');
      setSelectedTemplateIndex('');
      setMountPoint('');
      setPrefix('');
      setShowImportModal(false);
    }
  };

  // Save current scenario as a template
  const saveCurrentAsTemplate = () => {
    if (templateForm.name) {
      const newTemplate = {
        name: templateForm.name,
        description: templateForm.description,
        nodes: { ...nodes },
        edges: [...edges],
      };
      addTemplate(newTemplate);
      setTemplateForm({ name: '', description: '' });
      setShowSaveTemplateForm(false);
    }
  };

  // Export templates as JSON file
  const exportTemplatesAsJSON = () => {
    const templatesData = useTemplateStore.getState().exportTemplatesToJson();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templatesData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "szablony_wezlow_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import templates from JSON file
  const importTemplatesFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target!.result as string);
          useTemplateStore.getState().importTemplatesFromJson(data);
        } catch (error) {
          console.error("Błąd podczas wczytywania pliku szablonów węzłów JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mb-6 bg-gray-100 p-4 rounded-lg border">
      <h2 className="font-bold mb-3">Zarządzanie szablonami węzłów</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={() => setShowSaveTemplateForm(true)} 
          className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
        >
          Zapisz bieżący scenariusz jako szablon węzłów
        </button>
        <button 
          onClick={() => setShowImportModal(true)} 
          className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
        >
          Importuj szablon węzłów do scenariusza
        </button>

        <div className="grid grid-cols-2 gap-3 col-span-2">
          <button 
            onClick={exportTemplatesAsJSON} 
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Eksportuj szablony węzłów do pliku JSON
          </button>
          <div className="relative">
            <input 
              type="file" 
              accept=".json" 
              onChange={importTemplatesFromJSON} 
              className="absolute inset-0 opacity-0 w-full cursor-pointer" 
            />
            <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full">
              Wczytaj szablony węzłów z pliku JSON
            </button>
          </div>
        </div>
      </div>

      {/* Saved templates list */}
      {templates.length > 0 && (
        <div className="mt-4 bg-white p-3 rounded border">
          <h3 className="font-medium mb-2">Zapisane szablony węzłów ({templates.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {templates.map((template, index) => (
              <div key={index} className="p-2 border rounded bg-gray-50 text-sm">
                <div className="font-medium">{template.name}</div>
                {template.description && (
                  <div className="text-gray-600 mt-1">{template.description}</div>
                )}
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Węzły: {Object.keys(template.nodes).length}</span>
                  <span>Połączenia: {template.edges.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save template form modal */}
      {showSaveTemplateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Zapisz bieżący scenariusz jako szablon węzłów</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nazwa szablonu węzłów</label>
                <input 
                  value={templateForm.name} 
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Nazwa szablonu węzłów" 
                  className="w-full p-2 border rounded" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Opis (opcjonalnie)</label>
                <textarea 
                  value={templateForm.description} 
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  placeholder="Krótki opis szablonu węzłów" 
                  className="w-full p-2 border rounded h-24" 
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowSaveTemplateForm(false)} 
                  className="px-4 py-2 border rounded"
                >
                  Anuluj
                </button>
                <button 
                  onClick={saveCurrentAsTemplate}
                  disabled={!templateForm.name} 
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                >
                  Zapisz szablon węzłów
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import template modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Importuj szablon węzłów do scenariusza</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Wybierz szablon węzłów</label>
                <select
                  value={selectedTemplateIndex}
                  onChange={(e) => setSelectedTemplateIndex(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Wybierz szablon węzłów</option>
                  {templates.map((template, index) => (
                    <option key={index} value={index}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedTemplateIndex !== '' && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium">{templates[parseInt(selectedTemplateIndex)].name}</p>
                  {templates[parseInt(selectedTemplateIndex)].description && (
                    <p className="text-gray-600 mt-1">{templates[parseInt(selectedTemplateIndex)].description}</p>
                  )}
                  <p className="mt-1">
                    Liczba węzłów: {Object.keys(templates[parseInt(selectedTemplateIndex)].nodes).length}
                  </p>
                  <p>Liczba połączeń: {templates[parseInt(selectedTemplateIndex)].edges.length}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Punkt montowania (węzeł w bieżącym scenariuszu)
                </label>
                <select 
                  value={mountPoint} 
                  onChange={(e) => setMountPoint(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Wybierz węzeł</option>
                  {Object.keys(nodes).map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Prefiks dla importowanych węzłów
                </label>
                <input
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="np. sekcja1 (domyślnie: imported)"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowImportModal(false)} 
                  className="px-4 py-2 border rounded"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleImportTemplate}
                  disabled={selectedTemplateIndex === '' || !mountPoint}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                >
                  Importuj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;