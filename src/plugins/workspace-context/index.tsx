/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/workspace-context/index.tsx
import React, { useState, useEffect } from "react";
import {
  PluginBase,
  PluginProps,
} from "../../modules/plugins_system/PluginInterface";

import { useScenariosMultiStore } from "../../modules/scenarios_module/scenariosMultiStore";
import { Node } from "../../modules/scenarios_module/types";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, Target, Building, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/useToast";
import { useWorkspaceStore } from "@/modules/workspace_module/workspaceStore";

interface WorkspaceContextPluginConfig {
  includeUrl?: boolean;
  includeAudience?: boolean;
  includeBusinessGoal?: boolean;
  includeKeywords?: boolean;
  includeCompetitors?: boolean;
  includeNotes?: boolean;
  customKeys?: string[];
  format?: "json" | "text" | "template";
  templateText?: string;
}

const defaultConfig: WorkspaceContextPluginConfig = {
  includeUrl: true,
  includeAudience: true,
  includeBusinessGoal: true,
  includeKeywords: true,
  includeCompetitors: false,
  includeNotes: false,
  customKeys: [],
  format: "text",
  templateText:
    "Kontekst analizy:\n- URL: {{url}}\n- Grupa docelowa: {{audience}}\n- Cel biznesowy: {{businessGoal}}",
};

const ContextIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "url":
      return <Globe className="h-4 w-4" />;
    case "audience":
      return <Users className="h-4 w-4" />;
    case "businessGoal":
      return <Target className="h-4 w-4" />;
    case "competitors":
      return <Building className="h-4 w-4" />;
    default:
      return <ArrowRight className="h-4 w-4" />;
  }
};

class WorkspaceContextPlugin extends PluginBase {
  constructor() {
    super(
      "workspace-context",
      "Workspace Context",
      "Dostarcza kontekst z workspace do scenariusza"
    );
    this.defaultConfig = defaultConfig;
  }

  ViewComponent: React.FC<PluginProps> = ({ config, onResponseChange }) => {
    const { workspaces, currentWorkspaceId } = useWorkspaceStore();
    const { currentScenarioId, scenarios } = useScenariosMultiStore();
    const { toast } = useToast();

    const [context, setContext] = useState<Record<string, any>>({});
    const pluginConfig = { ...defaultConfig, ...config };

    // Get context from current workspace
    useEffect(() => {
      if (currentWorkspaceId && workspaces[currentWorkspaceId]) {
        setContext(workspaces[currentWorkspaceId].context || {});
      }
    }, [currentWorkspaceId, workspaces]);

    // Format context based on configuration
    const formatContext = (): string => {
      // Filter context based on configuration
      const filteredContext: Record<string, any> = {};

      if (pluginConfig.includeUrl && context.url)
        filteredContext.url = context.url;

      if (pluginConfig.includeAudience && context.audience)
        filteredContext.audience = context.audience;

      if (pluginConfig.includeBusinessGoal && context.businessGoal)
        filteredContext.businessGoal = context.businessGoal;

      if (pluginConfig.includeKeywords && context.keywords)
        filteredContext.keywords = context.keywords;

      if (pluginConfig.includeCompetitors && context.competitors)
        filteredContext.competitors = context.competitors;

      if (pluginConfig.includeNotes && context.notes)
        filteredContext.notes = context.notes;

      // Add custom keys
      (pluginConfig.customKeys || []).forEach((key) => {
        if (context[key] !== undefined) {
          filteredContext[key] = context[key];
        }
      });

      // Format based on selected format
      switch (pluginConfig.format) {
        case "json":
          return JSON.stringify(filteredContext, null, 2);

        case "template":
          let templateText = pluginConfig.templateText || "";
          Object.entries(filteredContext).forEach(([key, value]) => {
            templateText = templateText.replace(
              new RegExp(`\\{\\{${key}\\}\\}`, "g"),
              typeof value === "string"
                ? value
                : Array.isArray(value)
                ? value.join(", ")
                : JSON.stringify(value)
            );
          });
          return templateText;

        case "text":
        default:
          return Object.entries(filteredContext)
            .map(([key, value]) => {
              const valueStr =
                typeof value === "string"
                  ? value
                  : Array.isArray(value)
                  ? value.join(", ")
                  : JSON.stringify(value);
              return `${key}: ${valueStr}`;
            })
            .join("\n");
      }
    };

    // Generate and set response
    const generateResponse = () => {
      const formattedContext = formatContext();
      if (onResponseChange) {
        onResponseChange(formattedContext);
      }

      // If we have a current scenario, update its workspace context
      if (currentScenarioId && currentWorkspaceId) {
        useScenariosMultiStore
          .getState()
          .updateScenarioWorkspaceContext(
            currentScenarioId,
            workspaces[currentWorkspaceId].context
          );

        toast({
          title: "Kontekst zaktualizowany",
          description: "Kontekst workspace został dodany do scenariusza",
        });
      }
    };

    // Display empty state if no context available
    if (!currentWorkspaceId || Object.keys(context).length === 0) {
      return (
        <div className="text-center py-6 space-y-3">
          <p className="text-slate-500">
            Brak dostępnego kontekstu workspace. Przejdź do zakładki Workspaces,
            aby zdefiniować kontekst.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (onResponseChange) {
                onResponseChange("Brak dostępnego kontekstu workspace.");
              }
            }}
          >
            Użyj pustego kontekstu
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="border rounded-md p-3 bg-slate-50">
          <div className="text-sm font-medium mb-2">
            Dostępny kontekst workspace:
          </div>
          <div className="space-y-2">
            {Object.entries(context).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <ContextIcon type={key} />
                <Badge variant="outline" className="bg-white">
                  {key}
                </Badge>
                <span className="text-sm truncate">
                  {typeof value === "string"
                    ? value
                    : Array.isArray(value)
                    ? `[${value.length} items]`
                    : JSON.stringify(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-md text-sm">
          <p className="font-medium">Format:</p>
          <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
            {formatContext()}
          </pre>
        </div>

        <Button onClick={generateResponse} className="w-full">
          Użyj kontekstu workspace
        </Button>
      </div>
    );
  };

  ConfigComponent: React.FC<PluginProps> = ({ config, onConfigChange }) => {
    const pluginConfig = { ...defaultConfig, ...config };
    const [newCustomKey, setNewCustomKey] = useState("");

    const handleFormatChange = (format: string) => {
      if (onConfigChange) {
        onConfigChange({ format });
      }
    };

    const handleToggleChange = (
      key: keyof WorkspaceContextPluginConfig,
      value: boolean
    ) => {
      if (onConfigChange) {
        onConfigChange({ [key]: value });
      }
    };

    const handleAddCustomKey = () => {
      if (newCustomKey.trim() && onConfigChange) {
        const updatedCustomKeys = [
          ...(pluginConfig.customKeys || []),
          newCustomKey.trim(),
        ];
        onConfigChange({ customKeys: updatedCustomKeys });
        setNewCustomKey("");
      }
    };

    const handleRemoveCustomKey = (key: string) => {
      if (onConfigChange) {
        const updatedCustomKeys = (pluginConfig.customKeys || []).filter(
          (k) => k !== key
        );
        onConfigChange({ customKeys: updatedCustomKeys });
      }
    };

    const handleTemplateChange = (templateText: string) => {
      if (onConfigChange) {
        onConfigChange({ templateText });
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <Label>Format kontekstu</Label>
          <Select
            value={pluginConfig.format}
            onValueChange={handleFormatChange}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Wybierz format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Tekst prosty</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="template">Własny szablon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {pluginConfig.format === "template" && (
          <div>
            <Label>Szablon tekstu</Label>
            <p className="text-xs text-slate-500 mt-1">
              Użyj {`{{${"nazwaKlucza"}}}`} aby wstawić wartość z kontekstu
            </p>
            <Input
              value={pluginConfig.templateText || ""}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="mt-1.5"
              placeholder="Np. URL: {{url}}, Grupa docelowa: {{audience}}"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Wybierz dane kontekstowe</Label>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span>URL strony</span>
              </div>
              <Switch
                checked={!!pluginConfig.includeUrl}
                onCheckedChange={(checked) =>
                  handleToggleChange("includeUrl", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>Grupa docelowa</span>
              </div>
              <Switch
                checked={!!pluginConfig.includeAudience}
                onCheckedChange={(checked) =>
                  handleToggleChange("includeAudience", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-500" />
                <span>Cel biznesowy</span>
              </div>
              <Switch
                checked={!!pluginConfig.includeBusinessGoal}
                onCheckedChange={(checked) =>
                  handleToggleChange("includeBusinessGoal", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-green-500" />
                <span>Słowa kluczowe</span>
              </div>
              <Switch
                checked={!!pluginConfig.includeKeywords}
                onCheckedChange={(checked) =>
                  handleToggleChange("includeKeywords", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-red-500" />
                <span>Konkurencja</span>
              </div>
              <Switch
                checked={!!pluginConfig.includeCompetitors}
                onCheckedChange={(checked) =>
                  handleToggleChange("includeCompetitors", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <span>Notatki</span>
              </div>
              <Switch
                checked={!!pluginConfig.includeNotes}
                onCheckedChange={(checked) =>
                  handleToggleChange("includeNotes", checked)
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <Label>Niestandardowe klucze kontekstu</Label>

          <div className="flex gap-2">
            <Input
              value={newCustomKey}
              onChange={(e) => setNewCustomKey(e.target.value)}
              placeholder="Nazwa klucza"
              className="flex-grow"
            />
            <Button
              onClick={handleAddCustomKey}
              disabled={!newCustomKey.trim()}
            >
              Dodaj
            </Button>
          </div>

          {(pluginConfig.customKeys || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(pluginConfig.customKeys || []).map((key) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="bg-blue-50 flex items-center gap-1"
                >
                  {key}
                  <button
                    onClick={() => handleRemoveCustomKey(key)}
                    className="ml-1 text-slate-400 hover:text-red-500"
                  >
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  ResultComponent: React.FC<PluginProps> = ({ config, nodeId }) => {
    const { nodeResponses } =
      useScenariosMultiStore().scenarios[currentScenarioId] || {};
    const response = nodeId && nodeResponses ? nodeResponses[nodeId] : null;

    if (!response) {
      return (
        <div className="text-center py-6 text-slate-500">
          Brak zapisanej odpowiedzi dla tego węzła.
        </div>
      );
    }

    return (
      <div className="p-3 bg-slate-50 rounded-md border whitespace-pre-wrap">
        {response}
      </div>
    );
  };

  processNode(node: Node, response?: string): { node: Node; result: any } {
    // Just pass through any response
    return {
      node,
      result: response,
    };
  }
}

export default new WorkspaceContextPlugin();
