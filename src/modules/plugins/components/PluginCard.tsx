// src/modules/plugins/components/PluginCard.tsx
import React, { memo } from 'react';
import { Power, PowerOff } from 'lucide-react';
import { cn } from '@/utils/utils';
import { ComponentIcon } from './index';

interface PluginCardProps {
  pluginKey: string;
  isEnabled: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: (e: React.MouseEvent) => void;
}

// Memoized Plugin Card Component to prevent unnecessary re-renders
const PluginCard: React.FC<PluginCardProps> = memo(({
  pluginKey,
  isEnabled,
  isSelected,
  onSelect,
  onToggle,
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
}, (prevProps, nextProps) => {
  // Only re-render when these props change
  return (
    prevProps.pluginKey === nextProps.pluginKey &&
    prevProps.isEnabled === nextProps.isEnabled &&
    prevProps.isSelected === nextProps.isSelected
  );
});

PluginCard.displayName = 'PluginCard';

export default PluginCard;