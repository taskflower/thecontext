import React, { useState, useEffect } from 'react';
import { NodeManager, NodeData, ContextItem } from './src';

// Przykładowe dane
const initialNodes: NodeData[] = [
  {
    id: 'node-1',
    scenarioId: 'scenario-1',
    label: 'Welcome',
    description: 'Introduction to the scenario',
    position: { x: 100, y: 100 },
    assistantMessage: 'Welcome to the scenario! Your name is {{user.name}}.',
    contextKey: 'user_response'
  }
];

const initialContext: ContextItem[] = [
  {
    id: 'user',
    title: 'user',
    content: JSON.stringify({ name: 'John Doe', role: 'User' })
  }
];

function FlowPlayer() {
  const [nodeManager] = useState(() => new NodeManager(initialNodes));
  const [currentNodeId, setCurrentNodeId] = useState('node-1');
  const [userInput, setUserInput] = useState('');
  const [contextItems, setContextItems] = useState(initialContext);
  const [currentNode, setCurrentNode] = useState<NodeData | null>(null);

  // Załaduj i przygotuj węzeł do wyświetlenia
  useEffect(() => {
    const node = nodeManager.prepareNodeForDisplay(currentNodeId, contextItems);
    setCurrentNode(node);
  }, [currentNodeId, contextItems, nodeManager]);

  // Obsługa wysłania odpowiedzi użytkownika
  const handleSubmit = () => {
    if (!currentNode?.id) return;
    
    // Wykonaj węzeł i zaktualizuj kontekst
    const result = nodeManager.executeNode(currentNode.id, userInput, contextItems);
    if (result) {
      // Aktualizacja kontekstu
      if (result.contextUpdated) {
        setContextItems(result.updatedContext);
      }
      
      // Resetuj input
      setUserInput('');
      
      // W rzeczywistej aplikacji można by tu przejść do następnego węzła
      // na podstawie danych z krawędzi scenariusza
      setCurrentNodeId('node-2'); // Użycie setCurrentNodeId aby uniknąć błędu niewykorzystanej zmiennej
    }
  };

  if (!currentNode) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flow-player">
      <div className="assistant-message">
        {currentNode.assistantMessage}
      </div>
      
      <div className="user-input">
        <textarea 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your response..."
          rows={3}
        />
        
        <button onClick={handleSubmit}>Submit</button>
      </div>
      
      {currentNode.contextKey && (
        <div className="context-info">
          Response will be saved to: {currentNode.contextKey}
          {currentNode.contextJsonPath && ` / Path: ${currentNode.contextJsonPath}`}
        </div>
      )}
    </div>
  );
}

export default FlowPlayer;