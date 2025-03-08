// src/plugins/components/PluginMarketplace.tsx
import { useState, useEffect } from "react";
import { usePluginStore } from "../store/pluginStore";
import { PluginManifest } from "../types";
import { loadPluginFromUrl } from "../dynamicLoader";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Download,
  X,
  ExternalLink,
  Upload,
  PackagePlus,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// List of available plugins - using actual built plugins
const AVAILABLE_PLUGINS: PluginManifest[] = [
  {
    id: "text-input",
    name: "Text Input",
    version: "1.0.0",
    description: "Enhanced text input with validation and formatting",
    author: "Acme Plugins",
    repository: "https://github.com/acme/plugins",
  },
  {
    id: "example-input",
    name: "Example Plugin",
    version: "1.2.0",
    description: "Simple example plugin for the system",
    author: "Plugin Developer",
    repository: "https://github.com/example/plugins",
  }
];

export function PluginMarketplace({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>("marketplace");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [localPluginFile, setLocalPluginFile] = useState<File | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [installStatus, setInstallStatus] = useState<{id: string, success: boolean} | null>(null);

  const {
    installedPlugins,
    error,
    uninstallPlugin,
    enablePlugin,
    disablePlugin,
  } = usePluginStore();

  // Convert installed plugins to array for easier rendering
  const installedPluginsArray = Object.values(installedPlugins);

  // Filter available plugins to exclude already installed
  const availablePlugins = AVAILABLE_PLUGINS.filter(
    (plugin) => !installedPlugins[plugin.id]
  );

  // Update state when dialog closes
  useEffect(() => {
    if (!open) {
      setActiveTab("marketplace");
      setCustomUrl("");
      setLocalPluginFile(null);
      setInstallStatus(null);
    }
  }, [open]);

  // Install from URL handler
  const handleInstallFromUrl = async () => {
    if (!customUrl) return;

    setIsInstalling(true);
    setInstallStatus(null);
    try {
      const plugin = await loadPluginFromUrl(customUrl);
      if (plugin) {
        setInstallStatus({id: plugin.id, success: true});
        setCustomUrl("");
      } else {
        setInstallStatus({id: customUrl, success: false});
      }
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Failed to load plugin from URL:", error);
      setInstallStatus({id: customUrl, success: false});
    } finally {
      setIsInstalling(false);
    }
  };

  // Install from file handler
  const handleInstallFromFile = async () => {
    if (!localPluginFile) return;

    setIsInstalling(true);
    setInstallStatus(null);
    try {
      // Create URL for the file
      const blobUrl = URL.createObjectURL(localPluginFile);

      try {
        const plugin = await loadPluginFromUrl(blobUrl);
        if (plugin) {
          setInstallStatus({id: plugin.id, success: true});
        } else {
          setInstallStatus({id: localPluginFile.name, success: false});
        }
        // Trigger refresh
        setRefreshTrigger(prev => prev + 1);
      } finally {
        // Clean up URL
        URL.revokeObjectURL(blobUrl);
      }

      setLocalPluginFile(null);
    } catch (error) {
      console.error("Failed to load plugin from file:", error);
      setInstallStatus({id: localPluginFile.name, success: false});
    } finally {
      setIsInstalling(false);
    }
  };

  // Install from marketplace handler
  const handleInstallFromMarketplace = async (pluginId: string) => {
    setIsInstalling(true);
    setInstallStatus(null);
    try {
      // Use the actual path to the built plugin with base URL
      const baseUrl = window.location.origin;
      const pluginUrl = `${baseUrl}/plugins/${pluginId}/index.js`;
      console.log(`Installing plugin from: ${pluginUrl}`);
      
      const plugin = await loadPluginFromUrl(pluginUrl);
      if (plugin) {
        setInstallStatus({id: plugin.id, success: true});
      } else {
        setInstallStatus({id: pluginId, success: false});
      }
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(`Failed to install plugin ${pluginId}:`, error);
      setInstallStatus({id: pluginId, success: false});
    } finally {
      setIsInstalling(false);
    }
  };

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLocalPluginFile(e.target.files[0]);
    }
  };

  // Refresh plugins
  const handleRefreshPlugins = () => {
    setRefreshTrigger(prev => prev + 1);
    setInstallStatus(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Plugin Marketplace</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefreshPlugins}
              title="Refresh plugin list"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="installed">Installed</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {installStatus && (
            <Alert 
              variant={installStatus.success ? "default" : "destructive"} 
              className="mb-4"
            >
              {installStatus.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {installStatus.success 
                  ? `Successfully installed plugin: ${installStatus.id}` 
                  : `Failed to install plugin: ${installStatus.id}`}
              </AlertDescription>
            </Alert>
          )}

          <TabsContent value="installed" className="flex-1 overflow-auto">
            {installedPluginsArray.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No plugins installed yet. Check the marketplace or install a
                custom plugin.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {installedPluginsArray.map((plugin) => (
                  <Card key={plugin.id} className="p-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{plugin.id}</h3>
                      <span className="text-xs bg-primary/10 text-primary rounded px-2 py-1">
                        v{plugin.version}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <Button
                          variant={plugin.enabled ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            plugin.enabled
                              ? disablePlugin(plugin.id)
                              : enablePlugin(plugin.id)
                          }
                        >
                          {plugin.enabled ? "Disable" : "Enable"}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => uninstallPlugin(plugin.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Uninstall
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="marketplace" className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePlugins.map((plugin) => (
                <Card key={plugin.id} className="p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">{plugin.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary rounded px-2 py-1">
                      v{plugin.version}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {plugin.description}
                  </p>

                  <div className="text-xs text-muted-foreground mb-4">
                    Author: {plugin.author}
                  </div>

                  <div className="flex justify-between items-center">
                    {plugin.repository && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={plugin.repository}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Repository
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleInstallFromMarketplace(plugin.id)}
                      disabled={isInstalling}
                    >
                      {isInstalling ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      Install
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="flex-1 overflow-auto">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Install from URL</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/plugin/index.js"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleInstallFromUrl}
                    disabled={!customUrl || isInstalling}
                  >
                    {isInstalling ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    Install
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Install from local file</h3>
                <div className="flex flex-col gap-2">
                  <Input type="file" accept=".js" onChange={handleFileChange} />
                  {localPluginFile && (
                    <div className="text-sm">
                      Selected: {localPluginFile.name} (
                      {Math.round(localPluginFile.size / 1024)} KB)
                    </div>
                  )}
                  <Button
                    onClick={handleInstallFromFile}
                    disabled={!localPluginFile || isInstalling}
                    className="w-fit"
                  >
                    {isInstalling ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-1" />
                    )}
                    Install from file
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">
                  Install from developer folder
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You can install plugins from your development directory.
                  Plugins should be compiled and placed in the{" "}
                  <code>/public/plugins</code> folder.
                </p>
                <Button variant="outline">
                  <PackagePlus className="h-4 w-4 mr-1" />
                  Scan for local plugins
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}