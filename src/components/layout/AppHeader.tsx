// src/components/layout/AppHeader.tsx
import { Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useScenarioStore } from "../../stores/scenarioStore";

// Import icons
import { Folder, FileCode, Network, Play, ChevronDown } from "lucide-react";

// Route titles component
function RouteTitle({ title }: { title: string }) {
  return <h2 className="text-lg font-bold">{title}</h2>;
}

function AppHeader() {
  const { getCurrentWorkspace } = useWorkspaceStore();
  const { getCurrentScenario } = useScenarioStore();
  const navigate = useNavigate();

  const workspace = getCurrentWorkspace();
  const scenario = getCurrentScenario();

  return (
    <div className="flex items-center border-b justify-between p-6  mb-6 bg-white">
      <div>
        <Routes>
          <Route path="/" element={<RouteTitle title="Workspaces" />} />
          <Route path="/scenarios" element={<RouteTitle title="Scenarios" />} />
          <Route
            path="/flow-editor"
            element={<RouteTitle title="Flow Editor" />}
          />
          <Route path="/plugins" element={<RouteTitle title="Plugins" />} />
          <Route path="/execute" element={<RouteTitle title="Execute" />} />
        </Routes>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center text-sm gap-2 shadow-sm"
          >
            <Folder className="h-4 w-4" /> <span>Selected Workspase:</span>
            {workspace ? workspace.name : "No workspace"}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="flex flex-col p-2">
            <h4 className="font-medium text-sm mb-1">Current Context</h4>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Folder className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Workspace:</span>
            <span className="ml-1 text-sm opacity-80">
              {workspace ? workspace.name : "None"}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/scenarios")}
          >
            <FileCode className="h-4 w-4 text-emerald-600" />
            <span className="font-medium">Scenario:</span>
            <span className="ml-1 text-sm opacity-80">
              {scenario ? scenario.name : "None"}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/flow-editor")}
          >
            <Network className="h-4 w-4 text-purple-600" />
            <span className="font-medium">Nodes:</span>
            <span className="ml-1 text-sm opacity-80">
              {workspace && workspace.nodes ? workspace.nodes.length : 0}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/execute")}
          >
            <Play className="h-4 w-4 text-green-600" />
            <span>Execute Current Scenario</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default AppHeader;
