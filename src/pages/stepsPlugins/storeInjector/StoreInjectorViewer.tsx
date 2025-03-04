/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/storeInjector/StoreInjectorViewer.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Check,
  AlertCircle,
  FileText,
  ListTodo,
  ListChecks,
  File,
  Eye,
  EyeOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

import { ViewerProps } from "../types";
import { useDataStore } from "@/store";
import { useStepStore } from "@/store/stepStore";
import { ConversationItem } from "@/types";

export function StoreInjectorViewer({ step, onComplete }: ViewerProps) {
  const dataStore = useDataStore();
  const stepStore = useStepStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [sourceData, setSourceData] = useState<any>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  // Configuration options
  const {
    storeMethod = "addScenario",
    entityType = "scenario",
    sourceStep = "",
    itemsPath = "scenarios",
    dataTransformer = "",
    previewFields = ["title", "description"],
    confirmRequired = true,
  } = step.config || {};

  // Icons for different entity types
  const entityIcons: Record<string, React.ReactNode> = {
    scenario: <FileText className="h-4 w-4 text-blue-500" />,
    task: <ListTodo className="h-4 w-4 text-amber-500" />,
    step: <ListChecks className="h-4 w-4 text-purple-500" />,
    document: <File className="h-4 w-4 text-green-500" />,
  };

  // Extract data from source step
  useEffect(() => {
    if (!sourceStep) return;

    // Get the task data
    const task = dataStore.tasks.find((t) => t.id === step.taskId);
    if (!task) return;

    // Try to get the source step from the stepStore
    const getSourceStepData = async () => {
      try {
        // Get the step result
        const sourceStepObj = stepStore.getStepById(sourceStep);

        if (sourceStepObj && sourceStepObj.result) {
          setSourceData(sourceStepObj.result);

          // Extract items from the specified path
          let extractedItems: any[] = [];
          try {
            // Navigate through nested paths (e.g., "response.scenarios")
            const pathParts = itemsPath.split(".");
            let currentData = sourceStepObj.result;

            for (const part of pathParts) {
              if (!currentData) break;
              currentData = currentData[part];
            }

            if (Array.isArray(currentData)) {
              extractedItems = currentData;
            } else if (currentData) {
              // If not an array but exists, wrap in array
              extractedItems = [currentData];
            }

            // Apply data transformer if provided
            if (dataTransformer && extractedItems.length > 0) {
              try {
                // Use Function constructor for safer evaluation
                const transformerFn = new Function(
                  "items",
                  `return ${dataTransformer}`
                );
                extractedItems = transformerFn(extractedItems);
              } catch (e) {
                console.error("Error in data transformer:", e);
                setError(`Error in data transformer: ${(e as Error).message}`);
              }
            }

            // Add temporary IDs if not present
            extractedItems = extractedItems.map((item, index) => ({
              ...item,
              _tempId: item.id || `temp-${index}`,
            }));

            setItems(extractedItems);

            // Select all items by default
            const initialSelection = extractedItems.reduce(
              (acc: Record<string, boolean>, item: any) => {
                acc[item._tempId] = true;
                return acc;
              },
              {}
            );

            setSelectedItems(initialSelection);
          } catch (err) {
            setError(`Error extracting data: ${(err as Error).message}`);
          }
        } else {
          // If no source step result, check if it's in task.data
          if (task.data && task.data[sourceStep]) {
            setSourceData(task.data[sourceStep]);

            // Repeat similar extraction logic
            // This is simplified for brevity, but would follow same pattern as above
            // ...
          } else {
            setError(`No data found from source step: ${sourceStep}`);
          }
        }
      } catch (err) {
        setError(`Error loading source data: ${(err as Error).message}`);
      }
    };

    getSourceStepData();
  }, [sourceStep, itemsPath, dataTransformer, step.taskId, dataStore.tasks]);

  // Toggle item selection
  const toggleItem = (itemId: string) => {
    setSelectedItems({
      ...selectedItems,
      [itemId]: !selectedItems[itemId],
    });
  };

  // Select/deselect all items
  const toggleSelectAll = (selectAll: boolean) => {
    const newSelection: Record<string, boolean> = {};
    items.forEach((item) => {
      newSelection[item._tempId] = selectAll;
    });
    setSelectedItems(newSelection);
  };

  // Handle injection into the store
  const handleInject = async () => {
    setLoading(true);
    setError(null);

    try {
      // Filter selected items
      const selectedItemsList = items.filter(
        (item) => selectedItems[item._tempId]
      );

      if (selectedItemsList.length === 0) {
        setError("No items selected");
        setLoading(false);
        return;
      }

      // Check if the store method exists
      const storeAction = (dataStore as any)[storeMethod];
      if (typeof storeAction !== "function") {
        setError(`Store method "${storeMethod}" not found`);
        setLoading(false);
        return;
      }

      // Process and inject each item
      const injectedItems = [];

      for (const item of selectedItemsList) {
        // Remove temp properties
        const { _tempId, ...cleanItem } = item;

        // Add IDs if needed
        const itemToInject = {
          ...cleanItem,
          // Add a proper ID if not present
          id:
            cleanItem.id ||
            `${entityType}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        };

        // Add timestamps if not present
        if (!itemToInject.createdAt) {
          itemToInject.createdAt = new Date().toISOString();
        }

        if (!itemToInject.updatedAt) {
          itemToInject.updatedAt = new Date().toISOString();
        }

        // Call the store method
        await storeAction(itemToInject);
        injectedItems.push(itemToInject);
      }

      // Generate conversation items
      const conversationData: ConversationItem[] = [
        {
          role: "user",
          content: `Saving ${injectedItems.length} ${entityType}${
            injectedItems.length !== 1 ? "s" : ""
          } to the system`,
        },
        {
          role: "assistant",
          content: `Successfully saved ${injectedItems.length} ${entityType}${
            injectedItems.length !== 1 ? "s" : ""
          }.`,
        },
      ];

      // Simulate a delay for UX purposes
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Complete the step
      onComplete(
        {
          injectedItems,
          count: injectedItems.length,
          entityType,
          storeMethod,
          timestamp: new Date().toISOString(),
        },
        conversationData
      );
    } catch (err) {
      setError(`Error injecting data: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate preview text for an item
  const getPreviewText = (item: any, field: string) => {
    const value = item[field];
    if (value === undefined) return "N/A";

    if (typeof value === "string") {
      return value.length > 100 ? `${value.substring(0, 100)}...` : value;
    }

    if (typeof value === "object") {
      return JSON.stringify(value).slice(0, 50) + "...";
    }

    return String(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{step.title || `${entityType} Injector`}</CardTitle>
        <CardDescription>
          {step.description ||
            `Review and inject ${entityType} data into the application`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm">
            {items.length === 0 ? (
              <span className="text-muted-foreground">No items to review</span>
            ) : (
              <span>
                {Object.values(selectedItems).filter(Boolean).length} of{" "}
                {items.length} items selected
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Badge variant="outline" className="flex gap-1 items-center">
              {entityIcons[entityType] || <File className="h-4 w-4" />}
              {entityType}
            </Badge>

            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toggleSelectAll(
                    Object.values(selectedItems).filter(Boolean).length <
                      items.length
                  )
                }
                className="text-xs h-7"
              >
                {Object.values(selectedItems).filter(Boolean).length <
                items.length
                  ? "Select All"
                  : "Deselect All"}
              </Button>
            )}
          </div>
        </div>

        {sourceData && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Source Data</p>

              <Button variant="ghost" size="sm" className="h-7 px-2">
                {showJsonPreview ? (
                  <EyeOff className="h-4 w-4 mr-1" />
                ) : (
                  <Eye className="h-4 w-4 mr-1" />
                )}
                {showJsonPreview ? "Hide JSON" : "View JSON"}
              </Button>
            </div>

            <div className="mt-2 p-3 border rounded-md bg-muted/50 font-mono text-xs overflow-auto max-h-[200px]">
              <pre>{JSON.stringify(sourceData, null, 2)}</pre>
            </div>
          </>
        )}

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {items.map((item) => (
            <Card
              key={item._tempId}
              className={`border ${
                selectedItems[item._tempId]
                  ? "border-primary/50 bg-primary/5"
                  : ""
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start">
                  <Checkbox
                    id={item._tempId}
                    checked={selectedItems[item._tempId]}
                    onCheckedChange={() => toggleItem(item._tempId)}
                    className="mr-3 mt-1"
                  />

                  <div className="flex-1">
                    <div className="flex items-center">
                      {entityIcons[entityType] || (
                        <File className="h-4 w-4 text-muted-foreground mr-2" />
                      )}
                      <h3 className="text-base font-medium">
                        {item.title || item.name || `${entityType} item`}
                      </h3>
                    </div>

                    <div className="mt-2 space-y-1">
                      {previewFields
                        .filter(
                          (field) => field !== "title" && field !== "name"
                        )
                        .map((field) => (
                          <div key={field} className="text-sm">
                            <span className="font-medium text-muted-foreground">
                              {field}:{" "}
                            </span>
                            <span>{getPreviewText(item, field)}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {selectedItems[item._tempId] ? (
                    <Check className="h-5 w-5 text-primary" />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}

          {items.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              No data found from source. Please check your configuration or
              previous steps.
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          onClick={handleInject}
          disabled={
            loading ||
            items.length === 0 ||
            Object.values(selectedItems).filter(Boolean).length === 0
          }
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Save {Object.values(selectedItems).filter(Boolean).length}{" "}
              {entityType}
              {Object.values(selectedItems).filter(Boolean).length !== 1
                ? "s"
                : ""}
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
