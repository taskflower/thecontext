// src/modules/flow/components/ExportConversation.tsx
import React, { useState } from "react";
import { useAppStore } from "../../store";
import useHistoryStore from "../../history/historyStore";
import { Save } from "lucide-react";

const ExportConversation: React.FC = () => {
  const calculateFlowPath = useAppStore((state) => state.calculateFlowPath);
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const saveConversation = useHistoryStore((state) => state.saveConversation);

  const [exportStatus, setExportStatus] = useState("");

  const handleExport = () => {
    const scenario = getCurrentScenario();
    
    if (!scenario) {
      setExportStatus("error-no-scenario");
      setTimeout(() => setExportStatus(""), 3000);
      return;
    }
    
    const flowPath = calculateFlowPath();
    
    if (flowPath.length === 0) {
      setExportStatus("error-empty");
      setTimeout(() => setExportStatus(""), 3000);
      return;
    }
    
    const historyId = saveConversation(
      scenario.id,
      scenario.label,
      flowPath
    );
    
    setExportStatus("success");
    setTimeout(() => setExportStatus(""), 3000);
  };

  return (
    <div className="flex items-center gap-2">
      {exportStatus === "success" && (
        <span className="text-xs text-green-500">Saved!</span>
      )}
      {exportStatus === "error-no-scenario" && (
        <span className="text-xs text-red-500">No scenario selected</span>
      )}
      {exportStatus === "error-empty" && (
        <span className="text-xs text-red-500">Empty conversation</span>
      )}
      <button
        onClick={handleExport}
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1"
      >
        <Save className="h-3.5 w-3.5" />
        Export conversation
      </button>
    </div>
  );
};

export default ExportConversation;