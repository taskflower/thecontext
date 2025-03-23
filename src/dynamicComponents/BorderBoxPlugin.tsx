import React, { useState } from "react";
import { PluginComponentProps } from "../modules/plugins/types";

// Define the structure of our plugin data
interface SimpleBorderData {
  borderColor: string;
  messageTemplate?: string;
}

// Define default values
const defaultData: SimpleBorderData = {
  borderColor: "#3b82f6", // blue-500
  messageTemplate: "I recommend using {color} as the border color.",
};

const SimpleBorderPlugin: React.FC<PluginComponentProps> = ({
  data,
  appContext,
}) => {
  // State for feedback messages
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success"
  );

  // Merge provided data with defaults
  const options: SimpleBorderData = {
    ...defaultData,
    ...(data as SimpleBorderData),
  };

  // Get current node information if available
  const nodeId = appContext?.selection?.nodeId;
  const nodeName = appContext?.currentNode?.label || "Unknown Node";
  const currentUserPrompt = appContext?.currentNode?.userPrompt || "";

  // Function to handle writing the color to user message
  const handleWriteColorToUserMessage = () => {
    if (nodeId && appContext?.updateNodeUserPrompt) {
      try {
        // Get current message content
        console.log("Current message:", currentUserPrompt);

        // Append or update color information
        const colorInfo = `Border color: ${options.borderColor}`;
        const newMessage = currentUserPrompt
          ? `${currentUserPrompt}\n${colorInfo}`
          : colorInfo;

        // Update the message in the node
        appContext.updateNodeUserPrompt(nodeId, newMessage);

        // Show success feedback
        setFeedback(`Added to user message: "${colorInfo}"`);
        setFeedbackType("success");

        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback(null), 3000);

        console.log("Message updated to:", newMessage);
      } catch (error) {
        console.error("Error updating user message:", error);
        setFeedback(`Error: ${error.message}`);
        setFeedbackType("error");
      }
    } else {
      setFeedback(
        `Cannot update: nodeId=${nodeId}, has function=${!!appContext?.updateNodeUserPrompt}`
      );
      setFeedbackType("error");
    }
  };

  // Function to handle writing the color to assistant message
  const handleWriteColorToAssistantMessage = () => {
    if (nodeId && appContext?.updateNodeAssistantMessage) {
      try {
        // Get current assistant message
        const currentMessage = appContext.currentNode?.assistantMessage || "";
        console.log("Current assistant message:", currentMessage);

        // Use template if provided
        const template =
          options.messageTemplate ||
          "I recommend using {color} as the border color.";
        const colorMessage = template.replace("{color}", options.borderColor);

        // Append to existing message or create new one
        const newMessage = currentMessage
          ? `${currentMessage}\n\n${colorMessage}`
          : colorMessage;

        // Update the assistant message
        appContext.updateNodeAssistantMessage(nodeId, newMessage);

        // Show success feedback
        setFeedback(`Added to assistant message: "${colorMessage}"`);
        setFeedbackType("success");

        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback(null), 3000);

        console.log("Assistant message updated to:", newMessage);
      } catch (error) {
        console.error("Error updating assistant message:", error);
        setFeedback(`Error: ${error.message}`);
        setFeedbackType("error");
      }
    } else {
      setFeedback(
        `Cannot update: nodeId=${nodeId}, has function=${!!appContext?.updateNodeAssistantMessage}`
      );
      setFeedbackType("error");
    }
  };

  return (
    <div className="p-4">
      <div
        style={{
          borderColor: options.borderColor,
          borderWidth: "2px",
          borderStyle: "solid",
        }}
        className="w-full min-h-32 p-4 rounded-md bg-background"
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Node: {nodeName}</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            ID: {nodeId || "Not selected"}
          </span>
        </div>

        <div className="flex-1 p-4 text-center">
          <p className="mb-4">
            This box has a border with color:{" "}
            <strong>{options.borderColor}</strong>
          </p>

          {feedback && (
            <div
              className={`p-2 my-2 rounded-md text-sm ${
                feedbackType === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {feedback}
            </div>
          )}

          <div className="p-2 bg-muted/20 rounded-md mb-4 text-xs text-left">
            <p>
              <strong>Current Values:</strong>
            </p>
            <p>User prompt: {currentUserPrompt || "(empty)"}</p>
            <p>
              Assistant message:{" "}
              {appContext?.currentNode?.assistantMessage || "(empty)"}
            </p>
          </div>
        </div>

        {/* Buttons to write color to messages */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={handleWriteColorToUserMessage}
            disabled={!nodeId || !appContext?.updateNodeUserPrompt}
            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to user message
          </button>

          <button
            onClick={handleWriteColorToAssistantMessage}
            disabled={!nodeId || !appContext?.updateNodeAssistantMessage}
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to assistant message
          </button>
        </div>
      </div>
    </div>
  );
};

// Add options schema for the plugin editor
SimpleBorderPlugin.optionsSchema = {
  borderColor: {
    type: "color",
    label: "Border Color",
    default: defaultData.borderColor,
    description: "Color of the border",
  },
  messageTemplate: {
    type: "string",
    label: "Message Template",
    default: defaultData.messageTemplate,
    description:
      "Template for assistant message. Use {color} to insert the color value.",
  },
};

export default SimpleBorderPlugin;
