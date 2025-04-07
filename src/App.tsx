/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, ChangeEvent } from 'react';
import { NodeManager} from '../raw_modules/nodes-module/src';

// Define the type for FormField props
interface FormFieldProps {
  label: string;
  name?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'number' | 'email' | 'password';
  placeholder?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '', 
  required = false, 
  rows = 0, 
  hint = '' 
}) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1" htmlFor={name}>{label}</label>
    {rows > 0 ? (
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 border rounded"
        rows={rows}
        required={required}
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 border rounded"
        required={required}
      />
    )}
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);



// Komponent do wyświetlania przycisków "z powrotem"
const BackButton = ({ onClick }) => (
  <button onClick={onClick} className="text-blue-500 hover:text-blue-700">
    ← Powrót
  </button>
);

// Komponent głównej aplikacji
function App() {
  // Stan aplikacji
  const [nodeManager] = useState(() => new NodeManager());
  const [workspaces, setWorkspaces] = useState([{
    id: 'workspace-1', name: 'Podstawowy workspace', 
    scenarios: [{
      id: 'scenario-1', name: 'Prosty scenariusz', description: 'Przykładowy scenariusz',
      nodes: [
        { id: 'node-1', scenarioId: 'scenario-1', label: 'Powitanie', description: 'Pytanie o imię',
          position: { x: 100, y: 100 }, assistantMessage: 'Cześć! Jak masz na imię?', contextKey: 'user_name' },
        { id: 'node-2', scenarioId: 'scenario-1', label: 'Odpowiedź', description: 'Powitanie użytkownika',
          position: { x: 100, y: 250 }, assistantMessage: 'Miło Cię poznać, {{user_name}}!', contextKey: 'user_request' }
      ]
    }]
  }]);
  
  // Stan UI
  const [view, setView] = useState('workspaces');
  const [selectedIds, setSelectedIds] = useState({ workspace: null, scenario: null, node: null });
  const [nodeForm, setNodeForm] = useState(null);
  const [contextForm, setContextForm] = useState(null);
  const [flowState, setFlowState] = useState({ currentIndex: 0, userInput: '' });
  const [contextItems, setContextItems] = useState([]);

  // Aktualizacja NodeManager gdy zmienia się scenariusz
  useEffect(() => {
    const { workspace, scenario } = selectedIds;
    if (workspace && scenario) {
      const ws = workspaces.find(w => w.id === workspace);
      const sc = ws?.scenarios.find(s => s.id === scenario);
      if (sc?.nodes.length) {
        nodeManager.importNodes(sc.nodes);
        setFlowState({ currentIndex: 0, userInput: '' });
      }
    }
  }, [selectedIds.workspace, selectedIds.scenario, workspaces, nodeManager]);

  // Pomocnicze funkcje dostępu do danych
  const getWorkspace = () => workspaces.find(w => w.id === selectedIds.workspace);
  const getScenario = () => getWorkspace()?.scenarios.find(s => s.id === selectedIds.scenario);
  const getNodes = () => getScenario()?.nodes || [];
  const getNode = (id) => getNodes().find(n => n.id === id);
  const getCurrentFlowNode = () => {
    const nodes = getNodes();
    const { currentIndex } = flowState;
    if (!nodes.length || currentIndex >= nodes.length) return null;
    return nodeManager.prepareNodeForDisplay(nodes[currentIndex].id, contextItems);
  };

  // Funkcje dla workspace'ów
  const handleWorkspaces = {
    create: () => {
      const name = prompt('Nazwa workspace:');
      if (name?.trim()) {
        setWorkspaces([...workspaces, { id: `ws-${Date.now()}`, name, scenarios: [] }]);
      }
    },
    select: (id) => {
      setSelectedIds({ workspace: id, scenario: null, node: null });
      setView('scenarios');
    },
    delete: (id) => {
      if (confirm('Usunąć ten workspace?')) {
        setWorkspaces(workspaces.filter(w => w.id !== id));
        if (selectedIds.workspace === id) {
          setSelectedIds({ workspace: null, scenario: null, node: null });
          setView('workspaces');
        }
      }
    }
  };

  // Funkcje dla scenariuszy
  const handleScenarios = {
    create: () => {
      if (!selectedIds.workspace) return;
      const name = prompt('Nazwa scenariusza:');
      if (name?.trim()) {
        setWorkspaces(workspaces.map(w => w.id === selectedIds.workspace ? {
          ...w, scenarios: [...w.scenarios, { id: `sc-${Date.now()}`, name, description: '', nodes: [] }]
        } : w));
      }
    },
    select: (id) => {
      setSelectedIds({ ...selectedIds, scenario: id, node: null });
      setView('flow');
    },
    delete: (id) => {
      if (confirm('Usunąć ten scenariusz?')) {
        setWorkspaces(workspaces.map(w => w.id === selectedIds.workspace ? {
          ...w, scenarios: w.scenarios.filter(s => s.id !== id)
        } : w));
        if (selectedIds.scenario === id) {
          setSelectedIds({ ...selectedIds, scenario: null, node: null });
          setView('scenarios');
        }
      }
    }
  };

  // Funkcje dla węzłów
  const handleNodes = {
    create: () => {
      if (!selectedIds.scenario) return;
      const label = prompt('Nazwa węzła:');
      if (label?.trim()) {
        const newNode = {
          id: `node-${Date.now()}`,
          scenarioId: selectedIds.scenario,
          label,
          description: '',
          position: { x: 100, y: 100 + getNodes().length * 150 },
          assistantMessage: 'Wiadomość asystenta',
          contextKey: ''
        };
        
        nodeManager.addNode(newNode);
        setWorkspaces(workspaces.map(w => w.id === selectedIds.workspace ? {
          ...w, scenarios: w.scenarios.map(s => s.id === selectedIds.scenario ? {
            ...s, nodes: [...s.nodes, newNode]
          } : s)
        } : w));
      }
    },
    edit: (id) => {
      try {
        const node = getNode(id);
        if (node) {
          setSelectedIds({ ...selectedIds, node: id });
          setNodeForm({ ...node });
          setView('nodeEditor');
        } else {
          console.error(`Node ${id} not found`);
          alert(`Błąd: Węzeł o ID ${id} nie został znaleziony`);
        }
      } catch (error) {
        console.error('Error in edit node:', error);
      }
    },
    update: () => {
      if (!nodeForm) return;
      
      nodeManager.updateNode(nodeForm.id, nodeForm);
      setWorkspaces(workspaces.map(w => w.id === selectedIds.workspace ? {
        ...w, scenarios: w.scenarios.map(s => s.id === selectedIds.scenario ? {
          ...s, nodes: s.nodes.map(n => n.id === nodeForm.id ? nodeForm : n)
        } : s)
      } : w));
      
      setNodeForm(null);
      setSelectedIds({ ...selectedIds, node: null });
      setView('flow');
    },
    delete: (id) => {
      if (confirm('Usunąć ten węzeł?')) {
        nodeManager.removeNode(id);
        setWorkspaces(workspaces.map(w => w.id === selectedIds.workspace ? {
          ...w, scenarios: w.scenarios.map(s => s.id === selectedIds.scenario ? {
            ...s, nodes: s.nodes.filter(n => n.id !== id)
          } : s)
        } : w));
        
        if (selectedIds.node === id) {
          setSelectedIds({ ...selectedIds, node: null });
          setView('flow');
        }
      }
    }
  };

  // Funkcje dla navigacji
  const handleNavigation = {
    back: () => {
      switch (view) {
        case 'scenarios': 
          setSelectedIds({ workspace: null, scenario: null, node: null });
          setView('workspaces');
          break;
        case 'flow':
          setSelectedIds({ ...selectedIds, scenario: null, node: null });
          setView('scenarios');
          break;
        case 'nodeEditor':
        case 'contextEditor':
          setNodeForm(null);
          setContextForm(null);
          setSelectedIds({ ...selectedIds, node: null });
          setView('flow');
          break;
      }
    }
  };

  // Funkcje dla flow
  const handleFlow = {
    updateInput: (e) => setFlowState({ ...flowState, userInput: e.target.value }),
    next: () => {
      const currentNode = getCurrentFlowNode();
      if (!currentNode) return;
      
      const result = nodeManager.executeNode(currentNode.id, flowState.userInput, contextItems);
      if (result?.contextUpdated) {
        setContextItems(result.updatedContext);
      }
      
      const nodes = getNodes();
      if (flowState.currentIndex < nodes.length - 1) {
        setFlowState({ currentIndex: flowState.currentIndex + 1, userInput: '' });
      }
    },
    prev: () => {
      if (flowState.currentIndex > 0) {
        setFlowState({ ...flowState, currentIndex: flowState.currentIndex - 1 });
      }
    },
    finish: () => {
      const currentNode = getCurrentFlowNode();
      if (!currentNode) return;
      
      const result = nodeManager.executeNode(currentNode.id, flowState.userInput, contextItems);
      if (result?.contextUpdated) {
        setContextItems(result.updatedContext);
      }
      
      setView('scenarios');
    },
    editContext: () => {
      setContextForm([...contextItems]);
      setView('contextEditor');
    },
    saveContext: () => {
      setContextItems([...contextForm]);
      setContextForm(null);
      setView('flow');
    }
  };

  // Renderowanie listy workspace'ów
  const renderWorkspaces = () => (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Workspaces</h2>
        <button 
          onClick={handleWorkspaces.create}
          className="bg-blue-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
        >+</button>
      </div>
      
      <div className="space-y-2">
        {workspaces.map(workspace => (
          <div 
            key={workspace.id}
            className="flex justify-between items-center p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-50"
            onClick={() => handleWorkspaces.select(workspace.id)}
          >
            <span>{workspace.name}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); handleWorkspaces.delete(workspace.id); }}
              className="text-red-500"
            >×</button>
          </div>
        ))}
      </div>
    </div>
  );

  // Renderowanie listy scenariuszy
  const renderScenarios = () => {
    const workspace = getWorkspace();
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <BackButton onClick={handleNavigation.back} />
          <button 
            onClick={handleScenarios.create}
            className="bg-blue-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
          >+</button>
        </div>
        
        <h2 className="text-lg font-semibold mb-4">{workspace?.name || 'Scenariusze'}</h2>
        
        <div className="space-y-2">
          {workspace?.scenarios.map(scenario => (
            <div 
              key={scenario.id}
              className="flex justify-between items-center p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-50"
              onClick={() => handleScenarios.select(scenario.id)}
            >
              <div>
                <div>{scenario.name}</div>
                {scenario.description && <div className="text-xs text-gray-500">{scenario.description}</div>}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleScenarios.delete(scenario.id); }}
                className="text-red-500"
              >×</button>
            </div>
          ))}
          
          {(!workspace?.scenarios.length) && <div className="text-gray-500 text-sm italic">Brak scenariuszy</div>}
        </div>
      </div>
    );
  };

  // Renderowanie listy węzłów
  const renderNodesList = () => {
    const nodes = getNodes();
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <BackButton onClick={handleNavigation.back} />
          <div className="flex space-x-1">
            <button 
              onClick={handleFlow.editContext}
              className="bg-green-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
              title="Edytuj kontekst"
            >C</button>
            <button 
              onClick={handleNodes.create}
              className="bg-blue-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
              title="Dodaj węzeł"
            >+</button>
          </div>
        </div>
        
        <h2 className="text-lg font-semibold mb-4">{getScenario()?.name || 'Węzły'}</h2>
        
        <div className="space-y-2">
          {nodes.map((node, index) => (
            <div 
              key={node.id}
              className={`flex justify-between items-center p-2 rounded shadow cursor-pointer hover:bg-gray-50 ${
                flowState.currentIndex === index && view === 'flow' 
                  ? 'bg-blue-100 border-l-4 border-blue-500' 
                  : node.id === selectedIds.node 
                    ? 'bg-green-100 border-l-4 border-green-500' 
                    : 'bg-white'
              }`}
              onClick={() => handleNodes.edit(node.id)}
            >
              <div>
                <div>{node.label || `Node ${index + 1}`}</div>
                {node.description && <div className="text-xs text-gray-500">{node.description}</div>}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNodes.delete(node.id); }}
                className="text-red-500"
              >×</button>
            </div>
          ))}
          
          {(nodes.length === 0) && <div className="text-gray-500 text-sm italic">Brak węzłów</div>}
        </div>
      </div>
    );
  };

  // Renderowanie sekcji kontekstu
  const renderContextSection = () => (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Kontekst</h3>
        <button 
          onClick={handleFlow.editContext}
          className="text-xs text-blue-500 hover:text-blue-700"
        >Edytuj</button>
      </div>
      <div className="max-h-52 overflow-y-auto">
        {contextItems.length > 0 ? (
          <div className="space-y-1">
            {contextItems.map(item => (
              <div key={item.id} className="text-sm bg-white p-2 rounded shadow-sm">
                <span className="font-medium">{item.title}:</span>{' '}
                <span className="text-xs overflow-hidden overflow-ellipsis whitespace-nowrap">{item.content}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm italic">Brak elementów kontekstu</div>
        )}
      </div>
    </div>
  );

  // Renderowanie widoku flow
  const renderFlow = () => {
    const scenario = getScenario();
    const nodes = getNodes();
    
    if (nodes.length === 0) {
      return (
        <div className="flex-1 p-6 bg-gray-50">
          <h1 className="text-2xl font-bold mb-6">{scenario?.name || 'Flow'}</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="mb-4">Ten scenariusz nie ma jeszcze żadnych węzłów.</p>
            <button 
              onClick={handleNodes.create}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >Dodaj pierwszy węzeł</button>
          </div>
        </div>
      );
    }
    
    const currentNode = getCurrentFlowNode();
    if (!currentNode) return null;
    
    const isLastStep = flowState.currentIndex === nodes.length - 1;
    
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">{scenario?.name}</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Informacje o kroku */}
          <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
            <span>Krok {flowState.currentIndex + 1} z {nodes.length}</span>
            <span>{currentNode.label}</span>
          </div>
          
          {/* Wiadomość asystenta */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="text-sm font-semibold mb-2">Wiadomość asystenta:</h3>
            <div className="text-gray-700 whitespace-pre-line">{currentNode.assistantMessage}</div>
          </div>
          
          {/* Input użytkownika */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Odpowiedź:</h3>
            <textarea
              value={flowState.userInput}
              onChange={handleFlow.updateInput}
              placeholder="Wpisz swoją odpowiedź..."
              className="w-full p-3 border rounded-lg"
              rows={4}
            />
            
            {currentNode.contextKey && (
              <div className="mt-2 text-xs text-gray-500">
                Odpowiedź zapisana w: <code className="bg-gray-100 px-1 py-0.5 rounded">{currentNode.contextKey}</code>
                {currentNode.contextJsonPath && (
                  <span> (ścieżka: <code className="bg-gray-100 px-1 py-0.5 rounded">{currentNode.contextJsonPath}</code>)</span>
                )}
              </div>
            )}
          </div>
          
          {/* Przyciski nawigacyjne */}
          <div className="flex justify-between">
            <button
              onClick={handleFlow.prev}
              disabled={flowState.currentIndex === 0}
              className={`px-4 py-2 rounded ${
                flowState.currentIndex === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >← Wstecz</button>
            
            {isLastStep ? (
              <button
                onClick={handleFlow.finish}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >Zakończ</button>
            ) : (
              <button
                onClick={handleFlow.next}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >Dalej →</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renderowanie widoku edytora węzła
  const renderNodeEditor = () => {
    if (!nodeForm) return null;
    
    const handleChange = (e:any) => {
      const { name, value } = e.target;
      setNodeForm({ ...nodeForm, [name]: value });
    };
    
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">Edycja węzła: {nodeForm.label}</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={(e) => { e.preventDefault(); handleNodes.update(); }}>
            <FormField
              label="Etykieta"
              name="label"
              value={nodeForm.label}
              onChange={handleChange}
              placeholder="Etykieta węzła"
              required
            />
            
            <FormField
              label="Opis"
              name="description"
              value={nodeForm.description}
              onChange={handleChange}
              placeholder="Opcjonalny opis"
            />
            
            <FormField
              label="Wiadomość asystenta"
              name="assistantMessage"
              value={nodeForm.assistantMessage}
              onChange={handleChange}
              placeholder="Wiadomość wyświetlana użytkownikowi"
              rows={6}
              hint="Użyj {{nazwa_zmiennej}} aby wstawić wartość z kontekstu."
            />
            
            <FormField
              label="Klucz kontekstu"
              name="contextKey"
              value={nodeForm.contextKey}
              onChange={handleChange}
              placeholder="Nazwa zmiennej kontekstowej (opcjonalnie)"
              hint="Jeśli wypełnione, odpowiedź użytkownika będzie zapisana pod tą nazwą."
            />
            
            <FormField
              label="Ścieżka JSON"
              name="contextJsonPath"
              value={nodeForm.contextJsonPath}
              onChange={handleChange}
              placeholder="Ścieżka JSON dla zagnieżdżonych danych (opcjonalnie)"
              hint="Przykład: user.preferences.theme"
            />
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => { setNodeForm(null); setView('flow'); }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >Anuluj</button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >Zapisz</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Renderowanie widoku edytora kontekstu
  const renderContextEditor = () => {
    if (!contextForm) return null;
    
    const [newItemName, setNewItemName] = useState('');
    const [newItemContent, setNewItemContent] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    
    const handleChangeItem = (index, field, value) => {
      const updatedItems = [...contextForm];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      setContextForm(updatedItems);
    };
    
    const handleAddItem = () => {
      if (!newItemName.trim()) return;
      
      const newItem = {
        id: newItemName,
        title: newItemName,
        content: newItemContent || '{}'
      };
      
      setContextForm([...contextForm, newItem]);
      setNewItemName('');
      setNewItemContent('');
    };
    
    const handleRemoveItem = (index) => {
      const updatedItems = contextForm.filter((_, i) => i !== index);
      setContextForm(updatedItems);
    };
    
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">Edycja kontekstu</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Elementy kontekstu</h2>
          
          <div className="space-y-4 mb-6">
            {contextForm.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{item.title}</div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setEditingItem(editingItem === index ? null : index)}
                      className="text-blue-500 text-sm"
                    >{editingItem === index ? 'Zakończ' : 'Edytuj'}</button>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 text-sm"
                    >Usuń</button>
                  </div>
                </div>
                
                {editingItem === index ? (
                  <div className="space-y-2">
                    <FormField
                      label="ID"
                      value={item.id}
                      onChange={(e:any) => handleChangeItem(index, 'id', e.target.value)} name={undefined}                    />
                    <FormField
                      label="Tytuł"
                      value={item.title}
                      onChange={(e:any) => handleChangeItem(index, 'title', e.target.value)} name={undefined}                    />
                    <FormField
                      label="Zawartość"
                      value={item.content}
                      onChange={(e:any) => handleChangeItem(index, 'content', e.target.value)}
                      rows={3} name={undefined}                    />
                  </div>
                ) : (
                  <div className="text-sm bg-gray-50 p-2 rounded overflow-auto max-h-24">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
            
            {!contextForm?.length && (
              <div className="text-gray-500 text-sm italic">Brak elementów kontekstu</div>
            )}
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-2">Dodaj nowy element</h3>
            <div className="space-y-2">
              <FormField
                label="Nazwa/ID"
                value={newItemName}
                onChange={(e:any) => setNewItemName(e.target.value)}
                placeholder="Nazwa/ID elementu" name={undefined}              />
              <FormField
                label="Zawartość"
                value={newItemContent}
                onChange={(e:any) => setNewItemContent(e.target.value)}
                placeholder="Zawartość (JSON lub tekst)"
                rows={3} name={undefined}              />
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className={`px-4 py-2 rounded ${
                  !newItemName.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >Dodaj element</button>
            </div>
          </div>
          
          <div className="border-t mt-6 pt-6 flex justify-end">
            <button
              onClick={handleFlow.saveContext}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >Zapisz zmiany</button>
          </div>
        </div>
      </div>
    );
  };

  // Renderowanie sidebara
  const renderSidebar = () => (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-200">
        <h1 className="text-xl font-bold">Flow Builder</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {view === 'workspaces' && renderWorkspaces()}
        {view === 'scenarios' && renderScenarios()}
        {(view === 'flow' || view === 'nodeEditor' || view === 'contextEditor') && renderNodesList()}
      </div>
      
      {(view === 'flow' || view === 'nodeEditor' || view === 'contextEditor') && renderContextSection()}
    </div>
  );
  
  // Renderowanie głównej zawartości
  const renderContent = () => {
    switch (view) {
      case 'workspaces':
        return (
          <div className="flex-1 p-6 bg-gray-50">
            <h1 className="text-2xl font-bold mb-6">Wybierz workspace</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="mb-4 text-gray-700">Wybierz workspace z menu po lewej stronie lub utwórz nowy.</p>
              <p className="text-gray-500 text-sm">Workspaces to kontenery na scenariusze i węzły.</p>
            </div>
          </div>
        );
      case 'scenarios':
        return (
          <div className="flex-1 p-6 bg-gray-50">
            <h1 className="text-2xl font-bold mb-6">Workspace: {getWorkspace()?.name}</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="mb-4 text-gray-700">Wybierz scenariusz z menu po lewej stronie lub utwórz nowy.</p>
              <p className="text-gray-500 text-sm">Scenariusze to sekwencje węzłów tworzące flow interakcji.</p>
            </div>
          </div>
        );
      case 'flow':
        return renderFlow();
      case 'nodeEditor':
        return renderNodeEditor();
      case 'contextEditor':
        return renderContextEditor();
      default:
        return null;
    }
  };
  
  // Renderowanie aplikacji
  return (
    <div className="flex h-screen bg-gray-50">
      {renderSidebar()}
      {renderContent()}
    </div>
  );
}

export default App;