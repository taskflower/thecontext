// src/modules/plugins/components/PluginCard.tsx
import React, { memo, ReactNode } from 'react';
import { Power, PowerOff } from 'lucide-react';
import { cn } from '@/utils/utils';
import { ComponentIcon } from './index';
import { PluginType } from '../types';

interface PluginCardProps {
  pluginKey: string;
  pluginType?: PluginType;
  typeIcon?: ReactNode;
  isEnabled: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: (e: React.MouseEvent) => void;
}

// Memoized Plugin Card Component to prevent unnecessary re-renders
const PluginCard: React.FC<PluginCardProps> = memo(({
  pluginKey,
  pluginType,
  typeIcon,
  isEnabled,
  isSelected,
  onSelect,
  onToggle,
}) => {
  // Get a nice formatted name for display
  const displayName = pluginKey
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter

  return (
    <div
      className={cn(
        "border border-border rounded-lg overflow-hidden cursor-pointer transition-colors",
        isSelected 
          ? "border-primary/60 bg-primary/5" 
          : "hover:bg-muted/10",
        !isEnabled && "opacity-60"
      )}
      onClick={onSelect}
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          {typeIcon || <ComponentIcon name={pluginKey} className="h-5 w-5 mr-2 text-primary" />}
          <div>
            <h3 className="font-medium text-sm">{displayName}</h3>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{pluginType || 'Plugin'}</span>
            </div>
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
            <PowerOff className="h-3.5 w-3.5" />
          ) : (
            <Power className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {/* Status footer */}
      <div className={cn(
        "px-2 py-1.5 text-xs border-t border-border flex justify-between items-center",
        isEnabled 
          ? "bg-muted/20" 
          : "bg-muted/40"
      )}>
        <span className={cn(
          "px-1.5 py-0.5 rounded-full text-[10px]",
          isEnabled
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {isEnabled ? "Enabled" : "Disabled"}
        </span>
        {isSelected && (
          <span className="text-primary text-[10px]">Selected</span>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render when these props change
  return (
    prevProps.pluginKey === nextProps.pluginKey &&
    prevProps.isEnabled === nextProps.isEnabled &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.pluginType === nextProps.pluginType
  );
});

PluginCard.displayName = 'PluginCard';

export default PluginCard;