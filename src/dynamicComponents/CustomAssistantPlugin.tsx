// src/dynamicComponents/CustomAssistantPlugin.tsx
import React from "react";
import { PluginComponentProps } from "../modules/plugins/types";

// Define the structure of our plugin data
interface CustomAssistantData {
  backgroundColor: string;
  borderColor: string;
  headerText?: string;
}

// Define default values
const defaultData: CustomAssistantData = {
  backgroundColor: "#f3f4f6",
  borderColor: "#4ade80",
  headerText: "Custom Assistant Output",
};

const CustomAssistantPlugin: React.FC<PluginComponentProps> = ({
  data,
  appContext,
}) => {
  // Merge provided data with defaults
  const options: CustomAssistantData = {
    ...defaultData,
    ...(data as CustomAssistantData),
  };

  const messageContent = appContext?.currentNode?.assistantMessage || "No message available";

  return (
    <div className="mb-6">
      <div 
        className="rounded-lg p-4"
        style={{
          backgroundColor: options.backgroundColor,
          borderLeft: `4px solid ${options.borderColor}`
        }}
      >
        <h3 className="text-sm font-medium mb-2">{options.headerText}</h3>
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: messageContent }} />
      </div>
    </div>
  );
};

// Specify that this plugin should replace the assistant view
CustomAssistantPlugin.pluginSettings = {
  replaceAssistantView: true,
};

// Add options schema for the plugin editor
CustomAssistantPlugin.optionsSchema = {
  backgroundColor: {
    type: "color",
    label: "Background Color",
    default: defaultData.backgroundColor,
    description: "Background color for the assistant message box",
  },
  borderColor: {
    type: "color",
    label: "Accent Color",
    default: defaultData.borderColor,
    description: "Color for the left border of the message box",
  },
  headerText: {
    type: "string",
    label: "Header Text",
    default: defaultData.headerText,
    description: "Text to display as the header of the message",
  },
};

export default CustomAssistantPlugin;