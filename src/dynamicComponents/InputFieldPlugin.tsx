import {
  PluginComponentWithSchema,
  PluginComponentProps,
} from "../modules/plugins/types";
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
  placeholderText: "Wpisz ją tutaj...",
  defaultChecked: false,
  rows: 3,
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    <div className="mt-6 space-y-5">
      {options.fieldType === "input" ? (
        <div className="space-y-3">
          <label className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {options.labelText}
          </label>
          <div className="space-y-3">
            <div
              className={`relative w-full border-2 rounded-md transition-all ${
                inputSubmitEnabled
                  ? "border-primary"
                  : "border-input hover:border-primary/50"
              }`}
            >
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={options.placeholderText}
                className="flex h-12 w-full bg-transparent px-4 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-grow rounded-md"
              />
            </div>
            <button
              onClick={handleInputSubmit}
              disabled={!inputSubmitEnabled}
              className={`px-5 py-3 rounded-md transition-colors text-base font-medium w-full ${
                inputSubmitEnabled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      ) : options.fieldType === "textarea" ? (
        <div className="space-y-3">
          <label className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {options.labelText}
          </label>
          <div className="space-y-3">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              placeholder={options.placeholderText}
              rows={options.rows || 3}
              className={`flex w-full rounded-md border-2 bg-background px-4 py-3 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                textareaSubmitEnabled
                  ? "border-primary focus-visible:ring-primary"
                  : "border-input focus-visible:ring-ring"
              }`}
            />
            <button
              onClick={handleTextareaSubmit}
              disabled={!textareaSubmitEnabled}
              className={`px-5 py-3 rounded-md transition-colors text-base font-medium w-full ${
                textareaSubmitEnabled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      ) : options.fieldType === "url" ? (
        <div className="space-y-3">
          <label className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {options.labelText}
          </label>
          <div className="space-y-3">
            {/* Redesigned URL field to match checkbox styling */}
            <div
              className={`relative w-full border-2 rounded-md transition-all ${
                !isValidUrl && inputValue.trim().length > 0
                  ? "border-muted"
                  : urlSubmitEnabled
                  ? "border-primary"
                  : "border-input hover:border-primary/50"
              }`}
            >
              <div className="flex items-center p-2">
                <div
                  className={`flex items-center justify-center h-12 px-3 text-base rounded-md ${
                    urlSubmitEnabled
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  http://
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleUrlChange}
                  placeholder={options.placeholderText || "Enter URL..."}
                  className="flex h-12 w-full bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-grow"
                />
              </div>
            </div>

            {!isValidUrl && inputValue.trim().length > 0 && (
              <p className="text-muted-foreground text-sm">
                Please enter a valid URL with a domain extension (e.g. .com)
              </p>
            )}

            <button
              onClick={handleUrlSubmit}
              disabled={!urlSubmitEnabled}
              className={`px-5 py-3 rounded-md transition-colors text-base font-medium w-full ${
                urlSubmitEnabled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Zaznaczenie
          </label>
          <div className="space-y-3">
            <label
              htmlFor="checkbox-input"
              className={`flex items-center justify-between border-2 w-full p-5 rounded-md cursor-pointer transition-all ${
                isChecked
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-primary/50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`flex items-center justify-center h-5 w-5 rounded border-2 transition-colors ${
                    isChecked
                      ? "bg-primary border-primary"
                      : "bg-background border-muted-foreground"
                  }`}
                >
                  {isChecked && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5 text-white"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {options.labelText}
                </span>
              </div>
              <input
                id="checkbox-input"
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="sr-only"
              />
            </label>

            <button
              onClick={handleCheckboxSubmit}
              disabled={!checkboxSubmitEnabled}
              className={`px-5 py-3 rounded-md transition-colors text-base font-medium w-full ${
                checkboxSubmitEnabled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

InputFieldPlugin.pluginSettings = {
  replaceUserInput: true,
  hideNavigationButtons: true,
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
    description:
      "Placeholder text for the input field (only applies when Field Type is 'input', 'textarea' or 'url')",
  },
  defaultChecked: {
    type: "boolean",
    label: "Default Checked State",
    default: defaultData.defaultChecked,
    description:
      "Default checked state for the checkbox (only applies when Field Type is 'checkbox')",
  },
  rows: {
    type: "number",
    label: "Textarea Rows",
    default: defaultData.rows,
    description:
      "Number of rows for textarea (only applies when Field Type is 'textarea')",
  },
};

export default InputFieldPlugin;
