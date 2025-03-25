// src/dynamicComponents/QuickResponsePlugin.tsx
import { PluginComponentWithSchema, PluginComponentProps } from "../modules/plugins/types";

interface QuickResponseData {
  responses: Array<{
    text: string;
    color?: string;
  }>;
  headerText?: string;
}

const defaultData: QuickResponseData = {
  responses: [
    { text: "Yes, I understand.", color: "#4ade80" },
    { text: "No, I need more information.", color: "#f87171" },
    { text: "I have a question.", color: "#60a5fa" },
  ],
  headerText: "Quick Responses:",
};

const QuickResponsePlugin: PluginComponentWithSchema<QuickResponseData> = ({
  data,
  appContext,
}: PluginComponentProps<QuickResponseData>) => {
  const options: QuickResponseData = {
    ...defaultData,
    ...(data as QuickResponseData),
  };

  const handleClick = (response: string) => {
    if (appContext?.currentNode?.id && appContext.updateNodeUserPrompt) {
      appContext.updateNodeUserPrompt(appContext.currentNode.id, response);
    }
  };

  return (
    <div className="mt-4">
      <p className="text-sm font-medium mb-3">{options.headerText}</p>
      <div className="flex flex-wrap gap-2">
        {options.responses.map((response, index) => (
          <button
            key={index}
            onClick={() => handleClick(response.text)}
            className="px-4 py-2 rounded-md hover:bg-opacity-80 transition-colors text-white"
            style={{ backgroundColor: response.color || "#4ade80" }}
          >
            {response.text}
          </button>
        ))}
      </div>
    </div>
  );
};

QuickResponsePlugin.pluginSettings = {
  replaceUserInput: true,
};

QuickResponsePlugin.optionsSchema = {
  responses: {
    type: "string",
    label: "Response Options",
    default: JSON.stringify(defaultData.responses),
    description: "JSON array of response options with text and color",
  },
  headerText: {
    type: "string",
    label: "Header Text",
    default: defaultData.headerText,
    description: "Text to display above the response buttons",
  },
};

export default QuickResponsePlugin;
