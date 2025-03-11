import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const UsageInfo: React.FC = () => {
  return (
    <div className="mb-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-800 font-medium text-base">Guide: Prompt Sequence Creator</AlertTitle>
        <AlertDescription className="text-blue-700 mt-2">
          Create and manage interactive prompt sequences with this tool
        </AlertDescription>
      </Alert>

      <div className="mt-3 bg-white border rounded-md shadow-sm p-4">
        <h3 className="text-base font-medium mb-4">How to use this tool</h3>
        
        <ol className="space-y-3 text-sm text-gray-700 list-decimal pl-5">
          <li className="leading-relaxed">
            <span className="font-medium text-gray-900">Create nodes</span> - 
            Add prompts with questions or instructions in the "Add Node" section
          </li>
          <li className="leading-relaxed">
            <span className="font-medium text-gray-900">Connect nodes</span> - 
            Create a sequence by connecting nodes in the "Connect Nodes" section
          </li>
          <li className="leading-relaxed">
            <span className="font-medium text-gray-900">Use variables</span> - 
            Reference previous responses in your prompts using
            <code className="mx-1 px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded text-blue-600 font-mono">{'{{nodeId.response}}'}</code>
            format
          </li>
          <li className="leading-relaxed">
            <span className="font-medium text-gray-900">Execute the sequence</span> - 
            Run the entire graph or individual nodes to start the interaction
          </li>
          <li className="leading-relaxed">
            <span className="font-medium text-gray-900">Record responses</span> - 
            Enter responses at each step to be stored and used in subsequent steps
          </li>
        </ol>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-zinc-100">Nodes</Badge>
          <Badge variant="outline" className="bg-zinc-100">Sequences</Badge>
          <Badge variant="outline" className="bg-zinc-100">Templates</Badge>
          <Badge variant="outline" className="bg-zinc-100">Variables</Badge>
        </div>
      </div>
    </div>
  );
};

export default UsageInfo;