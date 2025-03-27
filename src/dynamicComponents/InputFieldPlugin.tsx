import { PluginComponentWithSchema, PluginComponentProps } from "../modules/plugins/types";
import { useState } from "react";

interface InputFieldData {
  fieldType: "input" | "checkbox";
  labelText: string;
  placeholderText?: string;
  defaultChecked?: boolean;
}

const defaultData: InputFieldData = {
  fieldType: "input",
  labelText: "Enter your response:",
  placeholderText: "Type here...",
  defaultChecked: false,
};

const InputFieldPlugin: PluginComponentWithSchema<InputFieldData> = ({
  data,
  appContext,
}: PluginComponentProps<InputFieldData>) => {
  const options: InputFieldData = {
    ...defaultData,
    ...(data as InputFieldData),
  };

  // Track initial checkbox state to detect changes
  const [initialCheckedState] = useState(options.defaultChecked || false);
  const [inputValue, setInputValue] = useState("");
  const [isChecked, setIsChecked] = useState(options.defaultChecked || false);
  
  // Determine if submit buttons should be enabled
  const inputSubmitEnabled = inputValue.trim().length > 0;
  const checkboxSubmitEnabled = isChecked !== initialCheckedState;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckedState = e.target.checked;
    setIsChecked(newCheckedState);
  };
  
  const handleInputSubmit = () => {
    console.log("Input Submit pressed", { inputValue, appContext });
    if (appContext?.currentNode?.id && appContext.updateNodeUserPrompt) {
      console.log("Updating user prompt with:", inputValue);
      appContext.updateNodeUserPrompt(appContext.currentNode.id, inputValue);
      
      // Przejdź do następnego kroku jeśli funkcja jest dostępna
      if (appContext.nextStep) {
        console.log("Przechodzę do następnego kroku");
        appContext.nextStep();
      }
    }
  };
  
  const handleCheckboxSubmit = () => {
    const valueToSend = isChecked ? "true" : "";
    console.log("Checkbox Submit pressed", { isChecked, valueToSend, appContext });
    if (appContext?.currentNode?.id && appContext.updateNodeUserPrompt) {
      console.log("Updating user prompt with:", valueToSend);
      appContext.updateNodeUserPrompt(appContext.currentNode.id, valueToSend);
      
      // Przejdź do następnego kroku jeśli funkcja jest dostępna
      if (appContext.nextStep) {
        console.log("Przechodzę do następnego kroku");
        appContext.nextStep();
      }
    }
  };

  return (
    <div className="mt-4">
      {options.fieldType === "input" ? (
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">{options.labelText}</label>
          <div className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={options.placeholderText}
              className="px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
            />
            <button
              onClick={handleInputSubmit}
              disabled={!inputSubmitEnabled}
              className={`px-4 py-2 rounded-r-md transition-colors ${
                inputSubmitEnabled 
                  ? "bg-blue-500 text-white hover:bg-blue-600" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="checkbox-input"
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="checkbox-input" className="ml-2 text-sm font-medium">
              {options.labelText}
            </label>
          </div>
          <button
            onClick={handleCheckboxSubmit}
            disabled={!checkboxSubmitEnabled}
            className={`px-4 py-2 rounded-md transition-colors text-sm ${
              checkboxSubmitEnabled 
                ? "bg-blue-500 text-white hover:bg-blue-600" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

InputFieldPlugin.pluginSettings = {
  replaceUserInput: true,
};

InputFieldPlugin.optionsSchema = {
  fieldType: {
    type: "string",
    label: "Field Type",
    default: defaultData.fieldType,
    description: "Type of input field to display (input or checkbox)",
  },
  labelText: {
    type: "string",
    label: "Label Text",
    default: defaultData.labelText,
    description: "Label text for the input field",
  },
  placeholderText: {
    type: "string",
    label: "Placeholder Text",
    default: defaultData.placeholderText,
    description: "Placeholder text for the input field (only applies when Field Type is 'input')",
  },
  defaultChecked: {
    type: "boolean",
    label: "Default Checked State",
    default: defaultData.defaultChecked,
    description: "Default checked state for the checkbox (only applies when Field Type is 'checkbox')",
  },
};

export default InputFieldPlugin;