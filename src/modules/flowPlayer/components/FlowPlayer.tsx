// src/modules/flowPlayer/components/FlowPlayer.tsx
import React from "react";
import { FlowControls } from "./Controls/FlowControls";
import { ConversationPanel } from "../../conversation/ConversationPanel";
import { AssistantMessageProcessor } from "./MessageProcessors/AssistantMessageProcessor";
import { UserMessageProcessor } from "./MessageProcessors/UserMessageProcessor";

export const FlowPlayer: React.FC = () => {
  return (
    <div className="h-full flex flex-col ">
      <FlowControls />

      <div className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto pb-4">
          <ConversationPanel />
        </div>
      </div>

      {/* Assistant message processor component */}
      <AssistantMessageProcessor />

      {/* User message processor component */}
      <UserMessageProcessor />
    </div>
  );
};