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
      />
      
      <div 
        style={{ 
          color: selected ? 'hsl(var(--primary))' : 'inherit',
          fontWeight: 500
        }}
      >
        {data.label}
      </div>
      
      {data.assistant && (
        <div style={{ 
          fontSize: '12px', 
          color: 'hsl(var(--muted-foreground))',
          marginTop: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {data.assistant.substring(0, 40)}
          {data.assistant.length > 40 ? "..." : ""}
        </div>
      )}
      
      <Handle
        type="source"
        position={sourcePosition}
        style={{ background: selected ? 'hsl(var(--primary))' : '#555' }}
      />
    </>
  );
}, nodePropsAreEqual);

export default CustomNode;