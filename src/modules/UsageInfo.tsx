import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const UsageInfo: React.FC = () => {
  return (
    <div className="mb-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-800 font-medium text-base">Prompt Workspace</AlertTitle>
        <AlertDescription className="text-blue-700 mt-2">
          Build custom prompt workflows with reusable templates and plugins
        </AlertDescription>
      </Alert>

      <div className="mt-3 bg-white border rounded-md shadow-sm p-4">
        <h3 className="text-base font-medium mb-4">Quick Start Guide</h3>
        
        <ol className="space-y-3 text-sm text-gray-700 list-decimal pl-5">
          <li className="leading-relaxed">
            <span className="font-medium text-gray-900">Workspaces</span> - 
            Organize related prompt flows in dedicated project areas
          </li>
          <li className="leading-relaxed">
            <span className="font-medium text-gray-900">Scenario templates</span> - 
            Use pre-built templates for common workflows or create your own
          </li>
          <li className="leading-relaxed">
            <span className="font-medium text-gray-900">Nodes</span> - 
            Connect prompt modules with
            <code className="mx-1 px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded text-blue-600 font-mono">{'{{nodeId.response}}'}</code>
            variables
          </li>
          <li className="leading-relaxed">
            <span className="font-medium text-gray-900">Plugins</span> - 
            Extend functionality with specialized processing modules
          </li>
          <li className="leading-relaxed">
            <span className="font-medium text-gray-900">Execute</span> - 
            Run workflows automatically or step-by-step with saved outputs
          </li>
        </ol>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-zinc-100 text-xs">Workspaces</Badge>
          <Badge variant="outline" className="bg-zinc-100 text-xs">Scenario Templates</Badge>
          <Badge variant="outline" className="bg-zinc-100 text-xs">Nodes</Badge>
          <Badge variant="outline" className="bg-zinc-100 text-xs">Plugins</Badge>
        </div>
      </div>
    </div>
  );
};

export default UsageInfo;