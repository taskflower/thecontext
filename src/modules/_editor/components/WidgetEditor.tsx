// src/modules/editor/components/WidgetEditor.tsx - Improved UX version
import { useState } from "react";

import { z } from "zod";
import WidgetCard from "./WidgetCard";
import { useLlmEngine } from "@/core";

// Widget schemas dla różnych typów widgetów
const WIDGET_SCHEMAS = {
  ButtonWidget: {
    title: { type: "string", label: "Button Text", required: true },
    attrs: {
      type: "object",
      properties: {
        navigationPath: { type: "string", label: "Navigation Path", required: true },
        variant: {
          type: "string",
          label: "Variant",
          enum: ["primary", "secondary", "default"],
          enumLabels: {
            primary: "Primary",
            secondary: "Secondary",
            default: "Default",
          },
        },
        colSpan: {
          type: "string",
          label: "Column Span",
          enum: ["1", "2", "3", "4", "5", "6", "full"],
          enumLabels: {
            "1": "1 Column",
            "2": "2 Columns",
            "3": "3 Columns",
            "4": "4 Columns",
            "5": "5 Columns",
            "6": "6 Columns",
            full: "Full Width",
          },
        },
      },
    },
  },
  InfoWidget: {
    title: { type: "string", label: "Widget Title", required: true },
    attrs: {
      type: "object",
      properties: {
        content: {
          type: "string",
          label: "Content",
          fieldType: "textarea",
          required: true,
        },
        description: { type: "string", label: "Description" },
        variant: {
          type: "string",
          label: "Variant",
          enum: ["default", "info", "success", "warning", "error"],
          enumLabels: {
            default: "Default",
            info: "Info",
            success: "Success",
            warning: "Warning",
            error: "Error",
          },
        },
        colSpan: {
          type: "string",
          label: "Column Span",
          enum: ["1", "2", "3", "4", "5", "6", "full"],
        },
      },
    },
  },
  TitleWidget: {
    title: { type: "string", label: "Title Text", required: true },
    attrs: {
      type: "object",
      properties: {
        description: { type: "string", label: "Description" },
        size: {
          type: "string",
          label: "Size",
          enum: ["small", "medium", "large"],
          enumLabels: { small: "Small", medium: "Medium", large: "Large" },
        },
        align: {
          type: "string",
          label: "Alignment",
          enum: ["left", "center", "right"],
          enumLabels: { left: "Left", center: "Center", right: "Right" },
        },
        colSpan: {
          type: "string",
          label: "Column Span",
          enum: ["1", "2", "3", "4", "5", "6", "full"],
        },
      },
    },
  },
};

interface WidgetEditorProps {
  widgets: any[];
  onChange: (widgets: any[]) => void;
}

export default function WidgetEditor({ widgets, onChange }: WidgetEditorProps) {
  const [selectedWidget, setSelectedWidget] = useState<number | null>(null);
  const [llmPrompt, setLlmPrompt] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // LLM do generowania widgetów
  const widgetGenerationSchema = z.object({
    widgets: z.array(
      z.object({
        tplFile: z.enum(["ButtonWidget", "InfoWidget", "TitleWidget"]),
        title: z.string(),
        attrs: z.record(z.any()),
      })
    ),
  });

  const {
    isLoading,
    result,
    error,
    start: generateWidgets,
  } = useLlmEngine({
    schema: widgetGenerationSchema,
    jsonSchema: {
      type: "object",
      properties: {
        widgets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              tplFile: {
                type: "string",
                enum: ["ButtonWidget", "InfoWidget", "TitleWidget"],
              },
              title: { type: "string" },
              attrs: { type: "object" },
            },
          },
        },
      },
    },
    userMessage: `Generate widgets based on user description. Available widgets:
    - ButtonWidget: for navigation buttons (use tplFile: "ButtonWidget")
    - InfoWidget: for displaying information panels (use tplFile: "InfoWidget") 
    - TitleWidget: for section headers (use tplFile: "TitleWidget")
    
    IMPORTANT: Use exact values from enum:
    - tplFile: "ButtonWidget", "InfoWidget", "TitleWidget" (EXACTLY these strings)
    - variant: "primary", "secondary", "default"
    - colSpan: "1", "2", "3", "4", "5", "6", "full"
    
    User request: ${llmPrompt}`,
    systemMessage: `You are a JSON generator. Return valid JSON matching the schema exactly. Use proper enum values.`,
  });

  const addWidget = (type: string) => {
    const newWidget = {
      tplFile: type,
      title: `New ${type}`,
      attrs:
        type === "ButtonWidget"
          ? { navigationPath: "", variant: "default", colSpan: "1" }
          : type === "InfoWidget"
          ? { content: "Widget content", variant: "default", colSpan: "1" }
          : { size: "medium", align: "left", colSpan: "1" },
    };
    onChange([...widgets, newWidget]);
  };

  const updateWidget = (index: number, updatedWidget: any) => {
    const newWidgets = [...widgets];
    newWidgets[index] = updatedWidget;
    onChange(newWidgets);
  };

  const removeWidget = (index: number) => {
    onChange(widgets.filter((_, i) => i !== index));
  };

  const handleLlmGeneration = () => {
    if (!llmPrompt.trim()) return;
    setShowPreview(false);
    generateWidgets();
  };

  const applyGeneratedWidgets = () => {
    if (result?.widgets) {
      onChange([...widgets, ...result.widgets]);
      setShowPreview(false);
      setLlmPrompt(""); // Wyczyść prompt po zastosowaniu
    }
  };

  const discardGenerated = () => {
    setShowPreview(false);
    setLlmPrompt("");
  };

  // Pokazuj preview gdy mamy wynik
  if (result && !showPreview) {
    setShowPreview(true);
  }

  return (
    <div className="p-6 space-y-6 flex gap-4">
      <div className="flex-1">
        {/* Manual Widget Creation */}
        <div className="mb-4">
          <h3 className="font-medium text-zinc-900 mb-3">
            Add Widget Manually
          </h3>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(WIDGET_SCHEMAS).map((type) => (
              <button
                key={type}
                onClick={() => addWidget(type)}
                className="px-3 py-2 text-sm bg-zinc-100 text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors"
              >
                + {type.replace("Widget", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Widget List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-zinc-900">Current Widgets</h3>
            <span className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
              {widgets.length} widget{widgets.length !== 1 ? "s" : ""}
            </span>
          </div>

          {widgets.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <div className="text-2xl mb-2">🧩</div>
              <div className="text-sm">
                No widgets yet. Use AI generation or add manually.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {widgets.map((widget, index) => (
                <WidgetCard
                  key={index}
                  widget={widget}
                  index={index}
                  isSelected={selectedWidget === index}
                  onSelect={() =>
                    setSelectedWidget(selectedWidget === index ? null : index)
                  }
                  onUpdate={(updatedWidget) =>
                    updateWidget(index, updatedWidget)
                  }
                  onRemove={() => removeWidget(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LLM Widget Generation */}
      <div className="w-1/3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="p-4">
          <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            🤖 Generate Widgets with AI
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-700"></div>
                Thinking...
              </div>
            )}
          </h3>

          <div className="space-y-3">
            <textarea
              value={llmPrompt}
              onChange={(e) => setLlmPrompt(e.target.value)}
              placeholder="Example: 'Create a dashboard with a welcome message, 3 navigation buttons for users, orders, and reports, and a quick stats info panel'"
              className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              disabled={isLoading}
            />

            <div className="flex gap-2">
              <button
                onClick={handleLlmGeneration}
                disabled={isLoading || !llmPrompt.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Generating...
                  </>
                ) : (
                  "✨ Generate"
                )}
              </button>

              {llmPrompt && (
                <button
                  onClick={() => setLlmPrompt("")}
                  className="px-3 py-2 text-zinc-600 hover:text-zinc-800"
                  disabled={isLoading}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="text-sm text-red-800">
                  <strong>Generation failed:</strong> {error}
                </div>
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer text-red-600">
                    Show technical details
                  </summary>
                  <pre className="text-xs mt-1 text-red-700 whitespace-pre-wrap">
                    {error}
                  </pre>
                </details>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center gap-3 text-sm text-blue-800">
                  <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div
                    className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <span>
                    AI is analyzing your request and generating widgets...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Widgets Preview */}
        {showPreview && result?.widgets && (
          <div className="border-t border-blue-200 bg-white">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-zinc-900 flex items-center gap-2">
                  ✨ Generated Widgets Preview ({result.widgets.length})
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={applyGeneratedWidgets}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    ✓ Add All
                  </button>
                  <button
                    onClick={discardGenerated}
                    className="px-3 py-1 text-zinc-600 text-sm rounded-md hover:bg-zinc-100"
                  >
                    ✕ Discard
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {result.widgets.map((widget:any, index:any) => (
                  <div
                    key={index}
                    className="border border-zinc-200 rounded-md p-3 bg-zinc-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-zinc-200 text-zinc-700 px-2 py-1 rounded">
                        {widget.tplFile}
                      </span>
                      <span className="text-sm font-medium text-zinc-900">
                        {widget.title}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-600">
                      {Object.entries(widget.attrs || {}).map(
                        ([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {String(value)}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
