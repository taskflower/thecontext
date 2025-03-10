/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/Dashboard.tsx
// (główny komponent aplikacji)
import React, { useState } from 'react';

import GraphVisualization from './graph_vizualizer/GraphVisualization';
import UsageInfo from './UsageInfo';



import TemplateManagement from './templates_module/TemplateManagement';

import { Template } from './templates_module/templateStore';

import SequenceConnections from './sequence_module/SequenceConnections';
import SequenceExecutor from './sequence_module/SequenceExecutor';
import SchemaManagement from './scenarios_module/SchemaManagement';
import { useScenarioStore } from './scenarios_module/scenarioStore';
import EdgeConnector from './scenarios_module/EdgeConnector';
import NodeCategories from './scenarios_module/NodeCategories';

const Dashboard: React.FC = () => {
  const { nodes, categories, nodeResponses, removeNodeResponse } = useScenarioStore();
  const [nodeForm, setNodeForm] = useState({ id: '', message: '', category: 'default' });
  const [newCategory, setNewCategory] = useState('');
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null); // Active template state

  const handleNodeClick = (id: string) => {
    const node = nodes[id];
    if (node.category === 'template' && node.templateData) {
      // Launch the template process
      console.log('Uruchamiam szablon:', node.templateData);
      setActiveTemplate(node.templateData);
      // Here you can open modal or go to a dedicated view for template execution
    } else {
      setPreviewNodeId(id);
    }
  };

  const closePreview = () => {
    setPreviewNodeId(null);
  };

  const processTemplateString = (templateString: string) => {
    return templateString.replace(/\{\{([\w.]+)\}\}/g, (match) => match);
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      useScenarioStore.getState().addCategory(newCategory);
      setNewCategory('');
    }
  };

  const handleAddNode = () => {
    if (nodeForm.id && nodeForm.message) {
      useScenarioStore.getState().addNode(nodeForm.id, nodeForm.message, nodeForm.category);
      setNodeForm({ id: '', message: '', category: nodeForm.category });
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Kreator Sekwencji Promptów</h1>

      <UsageInfo />

      {/* Zarządzanie szablonami */}
      <TemplateManagement />

      {/* Zarządzanie schematami */}
      <SchemaManagement />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Kategorie węzłów</h2>
          <div className="flex mb-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nazwa kategorii"
              className="flex-grow p-2 border rounded-l"
            />
            <button onClick={handleAddCategory} className="bg-purple-500 text-white px-3 py-2 rounded-r">
              Dodaj
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <span
                key={cat}
                className="bg-gray-200 py-1 px-2 rounded text-sm"
                onClick={() => setNodeForm({ ...nodeForm, category: cat })}
                style={{ cursor: 'pointer', outline: nodeForm.category === cat ? '2px solid #6366f1' : 'none' }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Dodaj węzeł (prompt)</h2>
          <div className="space-y-2">
            <input
              value={nodeForm.id}
              onChange={(e) => setNodeForm({ ...nodeForm, id: e.target.value })}
              placeholder="ID węzła"
              className="w-full p-2 border rounded"
            />
            <textarea
              value={nodeForm.message}
              onChange={(e) => setNodeForm({ ...nodeForm, message: e.target.value })}
              placeholder="Treść promptu (możesz użyć {{nodeId.response}})"
              className="w-full p-2 border rounded h-24"
            />
            <select
              value={nodeForm.category}
              onChange={(e) => setNodeForm({ ...nodeForm, category: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button onClick={handleAddNode} className="w-full bg-blue-500 text-white p-2 rounded">
              Dodaj węzeł
            </button>
          </div>
        </div>
      </div>

      <EdgeConnector />

      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="font-bold mb-2">Wizualizacja scenariusza</h2>
        <div className="border rounded-lg bg-gray-50 p-2">
          {Object.keys(nodes).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Dodaj węzły, aby zobaczyć wizualizację</p>
          ) : (
            <GraphVisualization onNodeClick={handleNodeClick} />
          )}
        </div>
      </div>

      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="font-bold mb-2">Podgląd scenariusza (węzły według kategorii)</h2>
        <div className="bg-white border rounded-lg p-4">
          {Object.keys(nodes).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Dodaj węzły, aby zobaczyć strukturę</p>
          ) : (
            <NodeCategories />
          )}
        </div>
      </div>

      <SequenceConnections />

      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="font-bold mb-2">Zapisane odpowiedzi</h2>
        {Object.keys(nodeResponses).length === 0 ? (
          <p className="text-gray-500">Brak zapisanych odpowiedzi</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(nodeResponses).map(([nodeId, response]) => (
              <div key={nodeId} className="bg-white p-3 rounded border">
                <div className="flex justify-between mb-1">
                  <h3 className="font-medium">{nodeId}</h3>
                  <button onClick={() => removeNodeResponse(nodeId)} className="text-red-500 text-xs">Usuń</button>
                </div>
                <div className="text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded border">
                  {response}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SequenceExecutor />

      {/* Preview node modal */}
      {previewNodeId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Podgląd węzła: {previewNodeId}</h3>
              <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mb-4">
              <div className="font-medium mb-2">Kategoria:</div>
              <div className="bg-gray-100 p-2 rounded">{nodes[previewNodeId]?.category}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium mb-2">Treść promptu:</div>
              <div className="bg-gray-100 p-3 rounded border whitespace-pre-wrap">
                {processTemplateString(nodes[previewNodeId]?.message || '')}
              </div>
            </div>
            {nodeResponses[previewNodeId] && (
              <div>
                <div className="font-medium mb-2">Zapisana odpowiedź:</div>
                <div className="bg-green-50 p-3 rounded border whitespace-pre-wrap">
                  {nodeResponses[previewNodeId]}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template modal */}
      {activeTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Realizacja szablonu: {activeTemplate.name}</h3>
              <button onClick={() => setActiveTemplate(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mb-4">
              {activeTemplate.description && (
                <p className="bg-gray-50 p-3 rounded mb-4">{activeTemplate.description}</p>
              )}
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-4">
                <h4 className="font-medium mb-2">Zawartość szablonu:</h4>
                <div className="flex space-x-1">
                  <span className="bg-blue-100 px-2 py-1 rounded">Węzły: {Object.keys(activeTemplate.nodes).length}</span>
                  <span className="bg-green-100 px-2 py-1 rounded">Połączenia: {activeTemplate.edges.length}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {Object.entries(activeTemplate.nodes).map(([id, node]: [string, any]) => (
                  <div key={id} className="border rounded p-2 bg-white">
                    <div className="font-medium">{id}</div>
                    <div className="text-xs text-gray-500">Kategoria: {node.category}</div>
                    <div className="text-sm mt-1 line-clamp-2">{node.message.substring(0, 100)}{node.message.length > 100 ? '...' : ''}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setActiveTemplate(null)} 
                className="px-4 py-2 border rounded"
              >
                Zamknij
              </button>
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  console.log('Uruchamianie logiki szablonu...');
                  // Here you can add logic for running the individual steps of the template
                  
                  // Get starting nodes (nodes without incoming edges)
                  const startingNodes = Object.keys(activeTemplate.nodes).filter(id => 
                    !activeTemplate.edges.some(edge => edge.target === id)
                  );
                  
                  if (startingNodes.length > 0) {
                    console.log('Rozpoczynam od węzłów:', startingNodes);
                    // You could trigger the SequenceExecutor logic here
                    // or implement custom template execution
                  }
                  
                  setActiveTemplate(null);
                }}
              >
                Uruchom szablon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;