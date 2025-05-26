// ========================================
// src/modules/edv2/scenario/NodesEditor.tsx
// ========================================
import { useState } from 'react';
import { AIGeneratorSection } from '../shared/AIGeneratorSection';
import { ItemList } from '../shared/ItemList';
import { createDefaultNode } from '../shared/editorUtils';
import { TEMPLATES } from '../shared/editorConfigs';

interface NodesEditorProps {
  nodes: any[];
  onChange: (nodes: any[]) => void;
}

export function NodesEditor({ nodes, onChange }: NodesEditorProps) {
  const [newNodeSlug, setNewNodeSlug] = useState('');

  const addNode = () => {
    if (!newNodeSlug.trim()) return;
    onChange([...nodes, createDefaultNode(newNodeSlug, nodes.length + 1)]);
    setNewNodeSlug('');
  };

  const removeNode = (index: number) => {
    onChange(nodes.filter((_, i) => i !== index));
  };

  const updateNode = (index: number, updates: any) => {
    const newNodes = [...nodes];
    newNodes[index] = { ...newNodes[index], ...updates };
    onChange(newNodes);
  };

  const moveNode = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === nodes.length - 1)) return;
    
    const newNodes = [...nodes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newNodes[index], newNodes[targetIndex]] = [newNodes[targetIndex], newNodes[index]];
    
    newNodes.forEach((node, i) => {
      node.order = i + 1;
    });
    
    onChange(newNodes);
  };

  const renderNode = (node: any, index: number) => (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs bg-zinc-200 px-2 py-1 rounded">{node.order}</span>
        <span className="text-sm font-medium">{node.slug}</span>
      </div>
      
      <div className="space-y-2">
        <input
          value={node.label}
          onChange={(e) => updateNode(index, { label: e.target.value })}
          className="w-full text-sm border rounded px-2 py-1"
          placeholder="Display label"
        />
        
        <select
          value={node.tplFile}
          onChange={(e) => updateNode(index, { tplFile: e.target.value })}
          className="w-full text-sm border rounded px-2 py-1"
        >
          {TEMPLATES.map(tpl => (
            <option key={tpl} value={tpl}>{tpl}</option>
          ))}
        </select>
        
        <textarea
          value={node.description || ''}
          onChange={(e) => updateNode(index, { description: e.target.value })}
          className="w-full text-sm border rounded px-2 py-1"
          rows={2}
          placeholder="Step description..."
        />
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      <AIGeneratorSection
        type="nodes"
        onApply={(result) => onChange([...nodes, ...result.nodes])}
        bgColor="bg-purple-50"
      />

      <div className="flex gap-2">
        <input
          value={newNodeSlug}
          onChange={(e) => setNewNodeSlug(e.target.value)}
          placeholder="Step slug (e.g., 'list', 'create')"
          className="flex-1 text-sm border rounded px-2 py-1"
        />
        <button
          onClick={addNode}
          disabled={!newNodeSlug.trim()}
          className="text-xs bg-zinc-900 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Add Step
        </button>
      </div>

      <ItemList
        items={nodes.sort((a, b) => a.order - b.order)}
        onAdd={addNode}
        onRemove={removeNode}
        onUpdate={updateNode}
        onMove={moveNode}
        renderItem={renderNode}
        addButtonText="Add Step"
        emptyMessage="No steps defined. Add steps to build your scenario."
        emptyIcon="🔗"
      />
    </div>
  );
}