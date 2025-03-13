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
import { auth, googleProvider } from "@/firebase/config";
import { useAuthState } from "../../hooks/useAuthState";

// Import icons
import { Folder, FileCode, Network, Play, ChevronDown, LogOut, Mail } from "lucide-react";
import { signInWithPopup } from "firebase/auth";

// Route titles component
function RouteTitle({ title }: { title: string }) {
  return <h2 className="text-lg font-bold">{title}</h2>;
}

function AppHeader() {
  const { getCurrentWorkspace } = useWorkspaceStore();
  const { getCurrentScenario } = useScenarioStore();
  const { user } = useAuthState();
  const navigate = useNavigate();

  const workspace = getCurrentWorkspace();
  const scenario = getCurrentScenario();

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex items-center border-b justify-between p-6 mb-6 bg-white">
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

      <div className="flex items-center gap-4">
        {/* Workspace Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center text-sm gap-2 shadow-sm"
            >
              <Folder className="h-4 w-4" /> <span>Selected Workspace:</span>
              {workspace ? workspace.name : "No workspace"}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-96">
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

        {/* User Authentication Section */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center text-sm gap-2 shadow-sm">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Wyloguj się</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            size="default" 
            className="flex items-center gap-2"
            onClick={handleGoogleLogin}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Continue with Google
          </Button>
        )}
      </div>
    </div>
  );
}

export default AppHeader;