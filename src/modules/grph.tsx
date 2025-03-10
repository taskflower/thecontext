import React, { useState } from 'react';
import { useGraphStore } from './graphStore';
import GraphVisualization from './GraphVisualization';
import UsageInfo from './UsageInfo';
import SchemaManagement from './SchemaManagement';
import EdgeConnector from './EdgeConnector';
import NodeCategories from './NodeCategories';
import SequenceConnections from './SequenceConnections';
import SequenceExecutor from './SequenceExecutor';

const CategoryFolderGraph: React.FC = () => {
  const { 
    nodes, categories, nodeResponses,
    addNode, addCategory, removeNodeResponse
  } = useGraphStore();

  const [nodeForm, setNodeForm] = useState({ id: '', message: '', category: 'default' });
  const [newCategory, setNewCategory] = useState('');
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);

  const handlePreviewNode = (id: string) => {
    setPreviewNodeId(id);
  };

  const closePreview = () => {
    setPreviewNodeId(null);
  };

  const processTemplateString = (templateString: string) => {
    return templateString.replace(/\{\{([\w.]+)\}\}/g, (match) => match);
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      addCategory(newCategory);
      setNewCategory('');
    }
  };

  const handleAddNode = () => {
    if (nodeForm.id && nodeForm.message) {
      addNode(nodeForm.id, nodeForm.message, nodeForm.category);
      setNodeForm({ id: '', message: '', category: nodeForm.category });
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Kreator Sekwencji Promptów</h1>

      <UsageInfo />

      {previewNodeId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {(() => {
            const node = nodes[previewNodeId];
            if (!node) return null;
            const processedMessage = processTemplateString(node.message);
            return (
              <div className="bg-white p-6 rounded-lg max-w-3xl w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Podgląd prompta: {previewNodeId}</h3>
                  <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="mb-4">
                  <div className="font-medium mb-2">Oryginalny prompt:</div>
                  <div className="bg-gray-100 p-3 rounded border whitespace-pre-wrap">{node.message}</div>
                </div>
                <div className="mb-4">
                  <div className="font-medium mb-2">Przetworzony prompt:</div>
                  <div className="bg-yellow-50 p-3 rounded border whitespace-pre-wrap">{processedMessage}</div>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  <p>
                    Zmienne w formacie <code className="bg-gray-100 px-1 rounded">{'{{nodeId.response}}'}</code> zostaną zastąpione odpowiedziami z bieżącego procesu.
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button onClick={closePreview} className="px-4 py-2 border rounded">Zamknij</button>
                  {/* W tym miejscu można dodać mechanizm wywołania wykonania prompta poprzez store */}
                </div>
              </div>
            );
          })()}
        </div>
      )}

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
        <h2 className="font-bold mb-2">Wizualizacja sekwencji</h2>
        <div className="border rounded-lg bg-gray-50 p-2">
          {Object.keys(nodes).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Dodaj węzły, aby zobaczyć wizualizację</p>
          ) : (
            <GraphVisualization onNodeClick={handlePreviewNode} />
          )}
        </div>
      </div>

      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="font-bold mb-2">Podgląd sekwencji (węzły według kategorii)</h2>
        <div className="bg-white border rounded-lg p-4">
          {Object.keys(nodes).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Dodaj węzły, aby zobaczyć strukturę</p>
          ) : (
            <NodeCategories />
          )}
        </div>
      </div>

      <SequenceConnections />

      <div className="bg-gray-50 p-4 rounded-lg">
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

      {/* Wstawiamy wydzielony komponent odpowiedzialny za wykonywanie sekwencji */}
      <SequenceExecutor />
    </div>
  );
};

export default CategoryFolderGraph;
