// src/dynamicComponents/CompleteCustomUIPlugin.tsx
import React from "react";
import { PluginComponentWithSchema, PluginComponentProps } from "../modules/plugins/types";

interface CompleteCustomUIData {
  title?: string;
  steps: Array<{
    title: string;
    content: string;
  }>;
}

const defaultData: CompleteCustomUIData = {
  title: "Complete Custom UI",
  steps: [
    { 
      title: "Step 1", 
      content: "This is the first step content. The plugin replaces the entire UI." 
    },
    { 
      title: "Step 2", 
      content: "This is the second step content. You can customize everything." 
    },
  ],
};

const CompleteCustomUIPlugin: PluginComponentWithSchema<CompleteCustomUIData> = ({
  data,
  appContext,
}: PluginComponentProps<CompleteCustomUIData>) => {
  const options: CompleteCustomUIData = {
    ...defaultData,
    ...(data as CompleteCustomUIData),
  };

  const [activeStep, setActiveStep] = React.useState(0);
  const nodeId = appContext?.currentNode?.id;
  const currentUserPrompt = appContext?.currentNode?.userPrompt || "";

  const handleNext = () => {
    if (activeStep < options.steps.length - 1) {
      setActiveStep(activeStep + 1);
      if (nodeId && appContext?.updateNodeUserPrompt) {
        appContext.updateNodeUserPrompt(nodeId, `Completed step ${activeStep + 1}`);
      }
    } else {
      if (nodeId && appContext?.updateNodeUserPrompt) {
        appContext.updateNodeUserPrompt(nodeId, "All steps completed");
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="space-y-4 p-2">
      {/* Nagłówek */}
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <h2 className="text-xl font-bold">{options.title}</h2>
        <div className="text-sm text-muted-foreground">
          Step {activeStep + 1} of {options.steps.length}
        </div>
      </div>

      {/* Pasek postępu */}
      <div className="flex mb-6">
        {options.steps.map((step, index) => (
          <div key={index} className="flex-1">
            <div
              className={`h-2 ${
                index <= activeStep ? "bg-primary" : "bg-muted"
              } ${index === 0 ? "rounded-l-full" : ""} ${
                index === options.steps.length - 1 ? "rounded-r-full" : ""
              }`}
            />
            <div className="text-xs mt-1 text-center">{step.title}</div>
          </div>
        ))}
      </div>

      {/* Treść kroku */}
      <div className="bg-muted/20 p-4 rounded-lg">
        <h3 className="font-medium mb-2">{options.steps[activeStep].title}</h3>
        <p>{options.steps[activeStep].content}</p>
      </div>

      {/* Nawigacja */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          disabled={activeStep === 0}
          className="px-4 py-2 rounded bg-secondary text-secondary-foreground disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 rounded bg-primary text-primary-foreground"
        >
          {activeStep === options.steps.length - 1 ? "Finish" : "Next"}
        </button>
      </div>

      {/* Informacje debug */}
      <div className="mt-6 text-xs text-muted-foreground">
        <div>Current user prompt: {currentUserPrompt}</div>
        <div>Node ID: {nodeId || "None"}</div>
      </div>
    </div>
  );
};

// Dodajemy statyczne właściwości do pluginu
CompleteCustomUIPlugin.pluginSettings = {
  replaceHeader: true,
  replaceAssistantView: true,
  replaceUserInput: true,
};

CompleteCustomUIPlugin.optionsSchema = {
  title: {
    type: "string",
    label: "Title",
    default: defaultData.title,
    description: "Main title for the custom UI",
  },
  steps: {
    type: "string",
    label: "Steps Configuration",
    default: JSON.stringify(defaultData.steps, null, 2),
    description: "JSON configuration for step content",
  },
};

export default CompleteCustomUIPlugin;
