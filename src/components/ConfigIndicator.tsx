// src/components/ConfigIndicator.tsx
import { FCWithChildren } from "@/core";
import { Database, File } from "lucide-react";

interface Props {
  configId: string;
  configType: "local" | "firebase" | "documentdb";
  config: { workspaces: any[]; scenarios: any[] };
}

const ConfigIndicator: FCWithChildren<Props> = ({
  configId,
  configType,
  config,
}) => {
  const isFirebase = configType === "firebase";
  const isDocDB = configType === "documentdb";
  const Icon = isFirebase ? Database : File;
  const colors = isFirebase
    ? ["bg-blue-100", "text-blue-800", "border-blue-200"]
    : isDocDB
    ? ["bg-purple-100", "text-purple-800", "border-purple-200"]
    : ["bg-green-100", "text-green-800", "border-green-200"];
  const label = isFirebase
    ? "Firebase App"
    : isDocDB
    ? "DocumentDB App"
    : "Local Config";

  return (
    <div
      className={`fixed left-4 bottom-4 z-50 px-3 py-2 text-xs rounded-md font-semibold flex items-center shadow-md border ${colors.join(
        " "
      )}`}
    >
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      <span>
        {label}: <span className="font-mono">{configId.slice(0, 8)}…</span>
        <span className="text-xs opacity-60 ml-2">
          ({config.workspaces.length} ws, {config.scenarios.length} sc)
        </span>
      </span>
    </div>
  );
};

export default ConfigIndicator;
