import { WorkspaceConfig } from "@/core";
import React, { useState } from "react";


interface WorkspaceDetailsProps {
  workspace: WorkspaceConfig;
}

export const WorkspaceDetails: React.FC<WorkspaceDetailsProps> = ({ workspace }) => {
  const [workspaceTab, setWorkspaceTab] = useState("widgets");

  return (
    <div className="bg-white rounded-md border border-gray-100">
      <div className="border-b border-gray-100 px-3 py-2 flex items-center">
        <span className="text-xs font-medium text-gray-500 mr-2">
          Obszar:
        </span>
        <h2 className="text-sm font-medium text-gray-700">{workspace.name || workspace.slug}</h2>
      </div>
      
      <div className="px-3 py-2">
        <div className="flex text-xs border-b border-gray-100 mb-2">
          <button 
            className={`mr-3 pb-1.5 ${workspaceTab === "widgets" 
              ? "text-gray-700 border-b border-gray-400" 
              : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setWorkspaceTab("widgets")}
          >
            Widgety
          </button>
          <button 
            className={`mr-3 pb-1.5 ${workspaceTab === "settings" 
              ? "text-gray-700 border-b border-gray-400" 
              : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setWorkspaceTab("settings")}
          >
            Ustawienia
          </button>
          <button 
            className={`mr-3 pb-1.5 ${workspaceTab === "json" 
              ? "text-gray-700 border-b border-gray-400" 
              : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setWorkspaceTab("json")}
          >
            JSON
          </button>
        </div>
        
        {workspaceTab === "widgets" && (
          <div className="space-y-2">
            {workspace.templateSettings?.widgets && workspace.templateSettings.widgets.map((widget, index) => (
              <div key={index} className="bg-gray-50 rounded p-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{widget.title}</span>
                  <span className="text-[10px] text-gray-500">{widget.colSpan || "default"}</span>
                </div>
                <p className="text-[10px] text-gray-500">{widget.tplFile}</p>
                {widget.data && <p className="mt-1 text-gray-600">{widget.data}</p>}
              </div>
            ))}
          </div>
        )}
        
        {workspaceTab === "settings" && (
          <div className="text-xs">
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">Layout:</span>
              <span className="text-gray-700">{workspace.templateSettings?.layoutFile || "Dashboard"}</span>
            </div>
          </div>
        )}
        
        {workspaceTab === "json" && (
          <div className="bg-gray-50 rounded p-2 overflow-auto max-h-[250px] text-xs font-mono text-gray-700">
            <pre>{JSON.stringify(workspace, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};