// src/modules/flowPlayer/components/FlowPlayer.tsx
import React, { useMemo } from "react";

import { ConversationPanel } from "../../conversation/ConversationPanel";
import { FlowProvider, useFlowPlayer } from "../context/FlowContext";
import { ComponentType } from "@/modules/plugin";

/**
 * A component wrapper that preserves component identity between renders
 */
const StableComponent = React.memo(({ 
  componentType 
}: { 
  componentType: ComponentType 
}) => {
  const { getComponent } = useFlowPlayer();
  const Component = useMemo(() => getComponent(componentType), [getComponent, componentType]);
  
  return <Component />;
});

// Set display name for debugging
StableComponent.displayName = 'StableComponent';

/**
 * The inner content of the FlowPlayer, using the FlowContext
 */
const FlowPlayerContent: React.FC = React.memo(() => {
  return (
    <div className="h-full flex flex-col gap-1">
      {/* Flow controls - fixed at top */}
      <div>
        <StableComponent componentType={ComponentType.FLOW_CONTROLS} />
      </div>

      {/* Conversation panel - scrollable and flexible height */}
      <div className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto pb-4">
          <ConversationPanel />
        </div>
      </div>

      {/* Assistant message processor */}
      <div className="transition-all duration-200">
        <StableComponent componentType={ComponentType.ASSISTANT_PROCESSOR} />
      </div>

      {/* User message processor */}
      <div className="transition-all duration-200">
        <StableComponent componentType={ComponentType.USER_PROCESSOR} />
      </div>
    </div>
  );
});

// Set display name for debugging
FlowPlayerContent.displayName = 'FlowPlayerContent';

/**
 * The main FlowPlayer component
 * Provides the FlowContext and renders the content
 */
export const FlowPlayer: React.FC = React.memo(() => {
  return (
    <FlowProvider>
      <FlowPlayerContent />
    </FlowProvider>
  );
});

// Set display name for debugging
FlowPlayer.displayName = 'FlowPlayer';