import { PluginComponentWithSchema, PluginComponentProps } from "../modules/plugins/types";
import { useState } from "react";
import { updateContextFromNodeInput } from "../modules/flow/contextHandler";

interface InputFieldData {
  fieldType: "input" | "checkbox" | "url" | "textarea";
  labelText: string;
  placeholderText?: string;
  defaultChecked?: boolean;
  rows?: number;
}

const defaultData: InputFieldData = {
  fieldType: "input",
  labelText: "Podaj swoją odpowiedź:",
  placeholderText: "Wpisz ją tutaj...",
  defaultChecked: false,
  rows: 3
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
  const textareaSubmitEnabled = inputValue.trim().length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (appContext?.currentNode?.id && appContext.updateNodeUserPrompt) {
      appContext.updateNodeUserPrompt(appContext.currentNode.id, inputValue);
      
      // Update context before moving to the next step
      if (appContext.currentNode.contextKey) {
        updateContextFromNodeInput(appContext.currentNode.id);
      }
      
      // Go to next step if function is available
      if (appContext.nextStep) {
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
    
    if (appContext?.currentNode?.id && appContext.updateNodeUserPrompt) {
      appContext.updateNodeUserPrompt(appContext.currentNode.id, processedUrl);
      
      // Update context before moving to the next step
      if (appContext.currentNode.contextKey) {
        updateContextFromNodeInput(appContext.currentNode.id);
      }
      
      // Go to next step if function is available
      if (appContext.nextStep) {
        appContext.nextStep();
      }
    }
  };
  
  const handleCheckboxSubmit = () => {
    const valueToSend = isChecked ? "true" : "";
    
    if (appContext?.currentNode?.id && appContext.updateNodeUserPrompt) {
      appContext.updateNodeUserPrompt(appContext.currentNode.id, valueToSend);
      
      // Update context before moving to the next step
      if (appContext.currentNode.contextKey) {
        updateContextFromNodeInput(appContext.currentNode.id);
      }
      
      // Go to next step if function is available
      if (appContext.nextStep) {
        appContext.nextStep();
      }
    }
  };
  
  const handleTextareaSubmit = () => {
    if (appContext?.currentNode?.id && appContext.updateNodeUserPrompt) {
      appContext.updateNodeUserPrompt(appContext.currentNode.id, inputValue);
      
      // Update context before moving to the next step
      if (appContext.currentNode.contextKey) {
        updateContextFromNodeInput(appContext.currentNode.id);
      }
      
      // Go to next step if function is available
      if (appContext.nextStep) {
        appContext.nextStep();
      }
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {options.fieldType === "input" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {options.labelText}
          </label>
          <div className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={options.placeholderText}
              className="flex h-9 w-full rounded-l-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex-grow"
            />
            <button
              onClick={handleInputSubmit}
              disabled={!inputSubmitEnabled}
              className={`h-9 px-4 rounded-r-md transition-colors text-sm font-medium ${
                inputSubmitEnabled 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Submit  
            </button>
          </div>
        </div>
      ) : options.fieldType === "textarea" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {options.labelText}
          </label>
          <div className="space-y-2">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              placeholder={options.placeholderText}
              rows={options.rows || 3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={handleTextareaSubmit}
              disabled={!textareaSubmitEnabled}
              className={`px-4 py-2 rounded-md transition-colors text-sm font-medium w-full ${
                textareaSubmitEnabled 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Submit  
            </button>
          </div>
        </div>
      ) : options.fieldType === "url" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {options.labelText}
          </label>
          <div className="space-y-1">
            <div className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={handleUrlChange}
                placeholder={options.placeholderText || "Enter URL..."}
                className={`flex h-9 w-full rounded-l-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 flex-grow ${
                  !isValidUrl && inputValue.trim().length > 0 
                    ? "border-destructive focus-visible:ring-destructive" 
                    : "border-input focus-visible:ring-ring"
                }`}
              />
              <button
                onClick={handleUrlSubmit}
                disabled={!urlSubmitEnabled}
                className={`h-9 px-4 rounded-r-md transition-colors text-sm font-medium ${
                  urlSubmitEnabled 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Submit  
              </button>
            </div>
            {!isValidUrl && inputValue.trim().length > 0 && (
              <p className="text-destructive text-xs">
                Please enter a valid URL with a domain extension (e.g. .com)
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="checkbox-input"
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-primary text-primary focus:ring-1 focus:ring-ring focus:ring-offset-1"
            />
            <label htmlFor="checkbox-input" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {options.labelText}
            </label>
          </div>
          <button
            onClick={handleCheckboxSubmit}
            disabled={!checkboxSubmitEnabled}
            className={`h-9 px-4 rounded-md transition-colors text-sm font-medium ${
              checkboxSubmitEnabled 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
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
  hideNavigationButtons: true
};

InputFieldPlugin.optionsSchema = {
  fieldType: {
    type: "string",
    label: "Field Type",
    default: defaultData.fieldType,
    description: "Type of input field to display",
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
    description: "Placeholder text for the input field (only applies when Field Type is 'input', 'textarea' or 'url')",
  },
  defaultChecked: {
    type: "boolean",
    label: "Default Checked State",
    default: defaultData.defaultChecked,
    description: "Default checked state for the checkbox (only applies when Field Type is 'checkbox')",
  },
  rows: {
    type: "number",
    label: "Textarea Rows",
    default: defaultData.rows,
    description: "Number of rows for textarea (only applies when Field Type is 'textarea')",
  },
};

export default InputFieldPlugin;