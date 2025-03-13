import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Puzzle, Flag } from "lucide-react";

const nodeColors: Record<
  string,
  { bg: string; border: string; hover: string }
> = {
  input: {
    bg: "bg-green-50",
    border: "border-green-200",
    hover: "hover:bg-green-100",
  },
  process: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    hover: "hover:bg-blue-100",
  },
  output: {
    bg: "bg-red-50",
    border: "border-red-200",
    hover: "hover:bg-red-100",
  },
  plugin: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    hover: "hover:bg-yellow-100",
  },
  default: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    hover: "hover:bg-gray-100",
  },
};

const CustomNode: React.FC<NodeProps> = (props) => {
  const { data, isConnectable } = props;

  const nodeType = data.type || "default";
  const colorScheme = nodeColors[nodeType] || nodeColors.default;

  return (
    <div className="relative group">
      <Card
        className={`w-72 shadow-sm transition-all duration-200 ${colorScheme.bg} ${colorScheme.border} border-2 ${colorScheme.hover}`}
      >
       <CardHeader className="py-2 px-3 flex flex-row justify-between items-center space-y-0">
  <CardTitle className="text-sm font-medium flex items-center">
    {data.isStartNode && (
      <Flag className="h-4 w-4 mr-1 text-blue-600" />
    )}
    {data.label || "Node"}
  </CardTitle>
  <div className="flex items-center space-x-1">
    {data.isStartNode && (
      <Badge
        variant="outline"
        className="text-xs py-0 h-5 flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-300"
      >
        Start
      </Badge>
    )}
    {data.pluginId && (
      <Badge
        variant="outline"
        className="text-xs py-0 h-5 flex items-center gap-1 bg-white"
      >
        <Puzzle size={12} />
        {data.pluginId}
      </Badge>
    )}
  </div>
</CardHeader>

        <CardContent className="p-3 pt-0">
          {/* Prompt preview */}
          <div className="text-xs font-mono bg-white/50 rounded p-2 max-h-24 overflow-hidden text-gray-700 border border-gray-100">
            {data.prompt ? (
              data.prompt.length > 150 ? (
                data.prompt.substring(0, 150) + "..."
              ) : (
                data.prompt
              )
            ) : (
              <span className="text-gray-400 italic">No prompt</span>
            )}
          </div>

          {/* Message preview if available */}
          {data.message && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-500 mb-1">
              Message:
              </p>
              <div className="text-xs bg-white/60 border-l-2 border-blue-300 p-2 max-h-20 overflow-hidden">
                {data.message.length > 100
                  ? data.message.substring(0, 100) + "..."
                  : data.message}
              </div>
            </div>
          )}
        </CardContent>

        {/* Execution status indicator */}
        {data.status && (
          <CardFooter
            className={`px-3 py-1 text-xs ${
              data.status === "completed"
                ? "bg-green-100 text-green-800"
                : data.status === "error"
                ? "bg-red-100 text-red-800"
                : data.status === "running"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {data.status}
          </CardFooter>
        )}
      </Card>

      {/* Connection handles with improved styling */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 bg-white border-gray-400 rounded-full hover:border-blue-500 transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 bg-white border-gray-400 rounded-full hover:border-blue-500 transition-colors"
      />
    </div>
  );
};

export default memo(CustomNode);