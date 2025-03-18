// src/modules/flowPlayer/components/FlowPlayer.tsx
import React, { useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { StepModal } from '@/components/APPUI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageProcessor } from '../../plugin/components/MessageProcessor';
import { useFlowPlayer } from '../hooks/useFlowPlayer';
import { useWorkspaceContext } from '../../context/hooks/useContext';
import { FlowNode } from '../../flow/types';

export const FlowPlayer: React.FC = () => {
  // Use ref to track if dialog is visible
  const isVisibleRef = useRef(false);
  
  const {
    isPlaying,
    canPlay,
    currentNodeIndex,
    flowPath,
    processedMessage,
    
    startFlow,
    stopFlow, 
    nextNode,
    previousNode,
    updateUserMessage,
    setProcessedMessage
  } = useFlowPlayer();
  
  // Update visibility state
  useEffect(() => {
    isVisibleRef.current = isPlaying && flowPath.length > 0;
  }, [isPlaying, flowPath]);
  
  const context = useWorkspaceContext();
  
  // Manually close dialog
  const handleStopFlow = () => {
    stopFlow();
  };
  
  // Render context save info
  const renderContextSaveInfo = (node?: FlowNode) => {
    if (!node?.contextSaveKey || node.contextSaveKey === "_none") return null;
    
    return (
      <div className="mt-1 text-xs text-muted-foreground">
        <i>Your response will be saved to context key: <strong>{node.contextSaveKey}</strong></i>
      </div>
    );
  };

  return (
    <>
      {/* Play Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          size="sm" 
          onClick={startFlow} 
          className="px-3 py-2 space-x-1"
          disabled={!canPlay}
        >
          <Play className="h-4 w-4 mr-1" />
          <span>Play Flow {!canPlay && '(Select Scenario)'}</span>
        </Button>
      </div>

      {/* Flow Player Modal */}
      {isPlaying && flowPath.length > 0 && (
        <StepModal
          steps={flowPath}
          currentStep={currentNodeIndex}
          onNext={nextNode}
          onPrev={previousNode}
          onClose={handleStopFlow}
          renderStepContent={(step) => {
            // Check if step exists and has required properties
            if (!step) return <div>No step data available</div>;
            
            return (
              <div className="flex flex-col space-y-6">
                {/* Assistant Message */}
                <Card className="p-4 border-muted bg-muted/20">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Assistant</h3>

                      {/* Display plugin badge if present */}
                      {step.plugin && (
                        <Badge variant="outline" className="text-xs">
                          {step.plugin}
                        </Badge>
                      )}
                    </div>

                    {/* Message processor component - only if step.assistant exists */}
                    {step.assistant && (
                      <MessageProcessor
                        message={context.processTemplate(step.assistant)}
                        onProcessed={setProcessedMessage}
                        autoProcess={true}
                        nodePlugins={step.plugin ? [step.plugin] : undefined}
                        nodePluginOptions={step.pluginOptions}
                      />
                    )}

                    <div className="text-sm whitespace-pre-line">
                      {processedMessage || 
                       (step.assistant ? context.processTemplate(step.assistant) : 'No message available')}
                    </div>
                  </div>
                </Card>

                {/* User Response */}
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm font-semibold">Your Response</h3>
                  {renderContextSaveInfo(step)}
                  <Textarea
                    className="min-h-[120px] resize-none"
                    placeholder="Type your message here..."
                    value={step.userMessage || ""}
                    onChange={(e) => updateUserMessage(e.target.value)}
                  />
                </div>
              </div>
            );
          }}
        />
      )}
    </>
  );
};