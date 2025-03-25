// src/dynamicComponents/CustomAssistantPlugin.tsx
import { PluginComponentWithSchema, PluginComponentProps } from "../modules/plugins/types";

interface CustomAssistantData {
  backgroundColor: string;
  borderColor: string;
  headerText?: string;
}

const defaultData: CustomAssistantData = {
  backgroundColor: "#f3f4f6",
  borderColor: "#4ade80",
  headerText: "Custom Assistant Output",
};

const CustomAssistantPlugin: PluginComponentWithSchema<CustomAssistantData> = ({
  data,
  appContext,
}: PluginComponentProps<CustomAssistantData>) => {
  const options: CustomAssistantData = {
    ...defaultData,
    ...(data as CustomAssistantData),
  };

  const messageContent =
    appContext?.currentNode?.assistantMessage || "No message available";

  return (
    <div className="mb-6">
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: options.backgroundColor,
          borderLeft: `4px solid ${options.borderColor}`,
        }}
      >
        <h3 className="text-sm font-medium mb-2">{options.headerText}</h3>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: messageContent }}
        />
      </div>
    </div>
  );
};

CustomAssistantPlugin.pluginSettings = {
  replaceAssistantView: true,
};

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
