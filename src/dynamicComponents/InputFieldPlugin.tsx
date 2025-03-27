import { PluginComponentWithSchema, PluginComponentProps } from "../modules/plugins/types";
import { useState } from "react";

interface InputFieldData {
  fieldType: "input" | "checkbox" | "url";
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
  const [isValidUrl, setIsValidUrl] = useState(true);
  
  // Determine if submit buttons should be enabled
  const inputSubmitEnabled = inputValue.trim().length > 0;
  const checkboxSubmitEnabled = isChecked !== initialCheckedState;
  const urlSubmitEnabled = inputValue.trim().length > 0 && isValidUrl;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Check if the URL has a domain extension (.xxx)
    const hasDomainExtension = /\.[a-z]{2,}($|\/)/i.test(value);
    setIsValidUrl(hasDomainExtension);
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
      
      // Go to next step if function is available
      if (appContext.nextStep) {
        console.log("Moving to next step");
        appContext.nextStep();
      }
    }
  };
  
  const handleUrlSubmit = () => {
    let processedUrl = inputValue.trim();
    
    // Add https:// if missing or incorrectly formatted
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = "https://" + processedUrl;
    }
    
    console.log("URL Submit pressed", { originalUrl: inputValue, processedUrl, appContext });
    
    if (appContext?.currentNode?.id && appContext.updateNodeUserPrompt) {
      console.log("Updating user prompt with:", processedUrl);
      appContext.updateNodeUserPrompt(appContext.currentNode.id, processedUrl);
      
      // Go to next step if function is available
      if (appContext.nextStep) {
        console.log("Moving to next step");
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
      
      // Go to next step if function is available
      if (appContext.nextStep) {
        console.log("Moving to next step");
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
      ) : options.fieldType === "url" ? (
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">{options.labelText}</label>
          <div className="flex flex-col">
            <div className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={handleUrlChange}
                placeholder={options.placeholderText || "Enter URL..."}
                className={`px-4 py-2 rounded-l-md border ${
                  !isValidUrl && inputValue.trim().length > 0 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-blue-500"
                } focus:outline-none focus:ring-2 flex-grow`}
              />
              <button
                onClick={handleUrlSubmit}
                disabled={!urlSubmitEnabled}
                className={`px-4 py-2 rounded-r-md transition-colors ${
                  urlSubmitEnabled 
                    ? "bg-blue-500 text-white hover:bg-blue-600" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit  
              </button>
            </div>
            {!isValidUrl && inputValue.trim().length > 0 && (
              <p className="text-red-500 text-xs mt-1">
                Please enter a valid URL with a domain extension (e.g. .com)
              </p>
            )}
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
  hideNavigationButtons: true // Disable navigation buttons
};

InputFieldPlugin.optionsSchema = {
  fieldType: {
    type: "string",
    label: "Field Type",
    default: defaultData.fieldType,
    description: "Type of input field to display (input, checkbox, or url)",
    enum: ["input", "checkbox", "url"],
    enumLabels: ["Text Input", "Checkbox", "URL Input"]
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
    description: "Placeholder text for the input field (only applies when Field Type is 'input' or 'url')",
  },
  defaultChecked: {
    type: "boolean",
    label: "Default Checked State",
    default: defaultData.defaultChecked,
    description: "Default checked state for the checkbox (only applies when Field Type is 'checkbox')",
  },
};

export default InputFieldPlugin;