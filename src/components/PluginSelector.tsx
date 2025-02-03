// src/components/PluginSelector.tsx
import React from "react";
import { plugins } from "@/plugins";

interface PluginSelectorProps {
  onSelect: (pluginId: string) => void;
}

export const PluginSelector: React.FC<PluginSelectorProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.values(plugins).map((plugin) => (
        <button
          key={plugin.id}
          onClick={() => onSelect(plugin.id)}
          className="flex flex-col items-center p-4 border rounded hover:shadow"
        >
          {plugin.icon ? (
            <div className="mb-2">{plugin.icon}</div>
          ) : (
            <div className="mb-2">[Brak ikony]</div>
          )}
          <span>{plugin.name}</span>
        </button>
      ))}
    </div>
  );
};
