import React, { useState, useEffect } from 'react';
import { Bot, MessageCircle, RotateCcw, Send, Save } from 'lucide-react';
import { useAppStore } from '../../store';
import { cn } from '@/utils/utils';
import { NodeMessage } from '@/modules/flow/types';


/**
 * Component for generating and editing node messages
 * Uses the existing data format (prompt/message)
 */
const NodeMessageHandler: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  
  const selectedNodeId = useAppStore(state => state.selected.node);
  const getNodeData = useAppStore(state => state.getNodeData);
  const updateNodeMessage = useAppStore(state => state.updateNodeMessage);
  
  // Load node data when selection changes
  useEffect(() => {
    if (selectedNodeId) {
      const nodeData = getNodeData(selectedNodeId);
      if (nodeData) {
        setPrompt(nodeData.userPrompt || '');
        setMessage(nodeData.assistantMessage || '');
        setIsEdited(false);
      }
    } else {
      setPrompt('');
      setMessage('');
      setIsEdited(false);
    }
  }, [selectedNodeId, getNodeData]);
  
  // Check if data has been changed
  useEffect(() => {
    if (selectedNodeId) {
      const nodeData = getNodeData(selectedNodeId);
      if (nodeData) {
        const promptChanged = prompt !== (nodeData.userPrompt || '');
        const messageChanged = message !== (nodeData.assistantMessage || '');
        setIsEdited(promptChanged || messageChanged);
      }
    }
  }, [prompt, message, selectedNodeId, getNodeData]);
  
  // Save changes to node
  const handleSave = () => {
    if (!selectedNodeId || !isEdited) return;
    
    const updateData: NodeMessage = {
      userPrompt: prompt,
      assistantMessage: message
    };
    
    updateNodeMessage(selectedNodeId, updateData);
    setIsEdited(false);
  };
  
  // Restore previous values
  const handleReset = () => {
    if (!selectedNodeId) return;
    
    const nodeData = getNodeData(selectedNodeId);
    if (nodeData) {
      setPrompt(nodeData.userPrompt || '');
      setMessage(nodeData.assistantMessage || '');
      setIsEdited(false);
    }
  };
  
  // Generate assistant response based on prompt
  const handleGenerate = async () => {
    if (!selectedNodeId || !prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Simulating response generation - in a real app this would be an API call
      setTimeout(() => {
        const generatedMessage = `This is an example assistant response to the prompt: "${prompt}"`;
        setMessage(generatedMessage);
        setIsGenerating(false);
        setIsEdited(true);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating response:', error);
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-card border border-border rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center">
          <MessageCircle className="h-4 w-4 mr-2 text-primary" />
          <h2 className="text-sm font-medium">Message Editor</h2>
        </div>
        
        {isEdited && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="text-xs px-2 py-1 rounded border border-border hover:bg-muted flex items-center"
              type="button"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Undo
            </button>
            <button
              onClick={handleSave}
              className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 flex items-center"
              type="button"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </button>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {!selectedNodeId ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Select a node to edit its messages
            </p>
          </div>
        ) : (
          <>
            {/* User message (prompt) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  <label htmlFor="user-prompt" className="text-sm font-medium">
                    User Prompt
                  </label>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className={cn(
                    "text-xs px-2 py-1 rounded flex items-center",
                    prompt.trim() && !isGenerating
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                  type="button"
                >
                  <Send className="h-3 w-3 mr-1" />
                  {isGenerating ? 'Generating...' : 'Generate Response'}
                </button>
              </div>
              <textarea
                id="user-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter user prompt..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background resize-none min-h-[120px]"
              />
            </div>
            
            {/* Assistant response (message) */}
            <div>
              <div className="flex items-center mb-2">
                <Bot className="h-4 w-4 mr-1.5 text-primary" />
                <label htmlFor="assistant-message" className="text-sm font-medium">
                  Assistant Response
                </label>
              </div>
              <textarea
                id="assistant-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter or generate assistant response..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background resize-none min-h-[120px]"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NodeMessageHandler;