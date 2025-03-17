// -------------------- Second Fix: Standardize CustomNode.tsx --------------------

// src/modules/flow/CustomNode.tsx
import { cn } from "@/utils/utils";
import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

// Custom comparison function for memo to prevent unnecessary rerenders
const nodePropsAreEqual = (prevProps: NodeProps, nextProps: NodeProps) => {
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.data.label === nextProps.data.label &&
    prevProps.data.assistant === nextProps.data.assistant
  );
};

const CustomNode = memo(({ 
  data, 
  selected, 
  targetPosition = Position.Top, 
  sourcePosition = Position.Bottom 
}: NodeProps) => {
  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        style={{ background: selected ? 'hsl(var(--primary))' : '#555' }}
        className="transition-colors duration-150"
      />
      
      <div className="px-3 py-2">
        <div 
          className={cn(
            "font-medium transition-colors duration-150",
            selected ? "text-primary" : "text-foreground"
          )}
        >
          {data.label}
        </div>
        
        {data.assistant && (
          <div className="text-xs text-muted-foreground mt-1 truncate max-w-full">
            {data.assistant.substring(0, 40)}
            {data.assistant.length > 40 ? "..." : ""}
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={sourcePosition}
        style={{ background: selected ? 'hsl(var(--primary))' : '#555' }}
        className="transition-colors duration-150"
      />
    </>
  );
}, nodePropsAreEqual);

export default CustomNode;