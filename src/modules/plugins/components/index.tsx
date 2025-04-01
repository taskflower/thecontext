 
import React from 'react';
import { Power, PowerOff, PlugZap, Check, Puzzle, GitBranch, Layers, Code, AlertCircle} from 'lucide-react';
import { cn } from '@/utils/utils';
import { Plugin } from '../types';

// Tab button component
export const TabButton = ({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => {
  return (
    <button 
      className={cn(
        "flex-1 py-2 px-3 text-xs font-medium rounded-md flex flex-col items-center gap-1",
        active 
          ? "bg-background text-primary" 
          : "text-muted-foreground hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

// Component icon helper
export const ComponentIcon = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const iconProps = { className: className || "h-5 w-5" };

  if (name.toLowerCase().includes("scenario")) {
    return <GitBranch {...iconProps} />;
  } else if (name.toLowerCase().includes("node")) {
    return <Layers {...iconProps} />;
  } else if (
    name.toLowerCase().includes("edge") ||
    name.toLowerCase().includes("connection")
  ) {
    return <Code {...iconProps} />;
  }

  return <Puzzle {...iconProps} />;
};

// Plugin Card Component
export const PluginCard = ({
  pluginKey,
  isEnabled,
  isSelected,
  onSelect,
  onToggle,
}: {
  pluginKey: string;
  isEnabled: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: (e: React.MouseEvent) => void;
}) => {
  return (
    <div
      className={cn(
        "border border-border rounded-lg overflow-hidden cursor-pointer transition-colors",
        isSelected 
          ? "border-primary/60 bg-primary/5" 
          : "hover:bg-muted/10",
        !isEnabled && "opacity-70"
      )}
      onClick={onSelect}
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <ComponentIcon name={pluginKey} className="h-5 w-5 mr-3 text-primary" />
          <div>
            <h3 className="font-medium">{pluginKey}</h3>
            <p className="text-xs text-muted-foreground">Component Plugin</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-md",
            isEnabled
              ? "text-destructive hover:bg-destructive/10"
              : "text-primary hover:bg-primary/10"
          )}
        >
          {isEnabled ? (
            <PowerOff className="h-4 w-4" />
          ) : (
            <Power className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className={cn(
        "px-3 py-2 text-xs border-t border-border flex justify-between items-center",
        isEnabled 
          ? "bg-muted/20" 
          : "bg-muted/40"
      )}>
        <span className={cn(
          "px-1.5 py-0.5 rounded-full",
          isEnabled
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {isEnabled ? "Enabled" : "Disabled"}
        </span>
        {isSelected && (
          <span className="text-primary">Active</span>
        )}
      </div>
    </div>
  );
};

// Plugin Manager UI Component
export const PluginManagerUI = ({
  plugins,
  selectedPlugin,
  onSelectPlugin,
  onTogglePlugin,
}: {
  plugins: Plugin[];
  selectedPlugin: string | null;
  onSelectPlugin: (key: string) => void;
  onTogglePlugin: (key: string) => void;
}) => {
  return (
    <div className="border rounded-lg shadow-sm overflow-hidden border-red border">
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <h2 className="text-lg font-medium flex items-center">
          <PlugZap className="h-5 w-5 mr-2 text-primary" />
          Plugin Manager
        </h2>
      </div>
      <div className="flex">
        {/* Plugin list column */}
        <div className="w-1/2 divide-y divide-border">
          {plugins.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No plugins available</p>
              <p className="text-sm mt-2">Check the documentation to learn how to create plugins</p>
            </div>
          ) : (
            plugins.map(plugin => (
              <div 
                key={plugin.key} 
                className="text-sm cursor-pointer"
                onClick={() => onSelectPlugin(plugin.key)}
              >
                <div className={cn(
                  "flex items-center justify-between px-4 py-3",
                  plugin.enabled ? "bg-background" : "bg-muted/30"
                )}>
                  <div className="flex items-center flex-1">
                    <div className="font-medium">{plugin.key}</div>
                    <div className={cn(
                      "ml-3 px-1.5 py-0.5 text-xs rounded-full",
                      plugin.enabled 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {plugin.enabled ? (
                        <span className="flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Enabled
                        </span>
                      ) : (
                        "Disabled"
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePlugin(plugin.key);
                    }}
                    className={cn(
                      "p-1.5 rounded-md flex items-center gap-1.5",
                      plugin.enabled 
                        ? "text-destructive hover:bg-destructive/10" 
                        : "text-primary hover:bg-primary/10"
                    )}
                  >
                    {plugin.enabled ? (
                      <>
                        <PowerOff className="h-4 w-4" />
                        <span className="font-medium">Disable</span>
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4" />
                        <span className="font-medium">Enable</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Plugin details column */}
        <div className="w-1/2 p-4">
          {selectedPlugin ? (
            (() => {
              const plugin = plugins.find(p => p.key === selectedPlugin);
              if (!plugin) return <p>Plugin not found</p>;
              return (
                <>
                  <h3 className="font-medium mb-2">Plugin Details</h3>
                  <div className="text-muted-foreground">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>ID:</div>
                      <div>{plugin.key}</div>
                      <div>Type:</div>
                      <div>Component Plugin</div>
                      <div>Status:</div>
                      <div className={plugin.enabled ? "text-primary" : "text-destructive"}>
                        {plugin.enabled ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs">
                        This plugin can be configured through the Plugin API. See documentation for more details.
                      </p>
                    </div>
                  </div>
                </>
              );
            })()
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>Select a plugin to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



// Status/Info UI Components
export const NoPluginsAvailableUI = () => (
  <div className="rounded-lg border border-border p-6 text-center">
    <div className="mb-4 flex justify-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium mb-2">No Plugins Available</h3>
    <p className="text-muted-foreground mb-4">
      No components have been registered yet. Use the global registry to
      register components.
    </p>
    <div className="bg-muted p-4 rounded-md overflow-auto text-left text-sm">
      <pre className="whitespace-pre-wrap">
        {`// Register a component dynamically
const MyComponent = () => <div>My Component Content</div>;

// Method 1: Using the window object
window.__DYNAMIC_COMPONENTS__.register('MyComponent', MyComponent);

// Method 2: Using the exported function
import { registerDynamicComponent } from './store/dynamicComponentStore';
registerDynamicComponent('MyComponent', MyComponent);`}
      </pre>
    </div>
  </div>
);

export const PluginDisabledUI = () => (
  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center">
    <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
    <p className="text-sm">
      The selected component is currently disabled. Enable it to use it.
    </p>
  </div>
);

export const SelectPluginMessageUI = () => (
  <div className="text-center p-6 text-muted-foreground">
    <p>Select a plugin from the left column to preview it here.</p>
  </div>
);

export const AllPluginsDisabledMessageUI = () => (
  <div className="text-center p-6 text-muted-foreground">
    <p>All plugins are currently disabled.</p>
  </div>
);