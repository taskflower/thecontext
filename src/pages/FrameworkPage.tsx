/* eslint-disable @typescript-eslint/no-explicit-any */
import WorkspaceIcon from "@/components/frameworkLanding/WorkspaceIcon";
import { AppFooter } from "@/components/frontApp";
import { db } from "@/firebase/config";
import { workspaceService } from "@/services/WorkspaceService";
import { useAppStore } from "@/modules/store";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Package, Layers, Code, Database, Plus, Frame } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  validateWorkspace,
  addWorkspace,
  replaceWorkspace,
} from "@/components/studio/cloud-sync/workspaceUtils";

const FrameworkPage: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Get needed elements from the app state
  const state = useAppStore();

  useEffect(() => {
    const fetchOfficialWorkspaces = async () => {
      try {
        // Query Firestore for workspaces with permission "official"
        const workspacesCollection = collection(db, "workspaces");
        const q = query(
          workspacesCollection,
          where("permission", "==", "official")
        );
        const querySnapshot = await getDocs(q);

        const officialWorkspaces: any[] = [];
        querySnapshot.forEach((doc) => {
          // Only extract the metadata we need for display
          const data = doc.data();
          officialWorkspaces.push({
            id: doc.id,
            title: data.title,
            description: data.description || "",
            slug: data.slug || "",
            permission: data.permission,
            userId: data.userId || "", // Include userId from workspace data
          });
        });

        setWorkspaces(officialWorkspaces);
      } catch (error) {
        console.error("Error fetching official workspaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficialWorkspaces();
  }, []);

  const handleWorkspaceClick = async (workspace: any) => {
    try {
      setLoading(true);

      // Important: Get userId from the workspace data
      const userId = workspace.userId || ""; // Use userId directly from workspace metadata

      // Get full workspace data from Firebase using workspaceService
      const fullWorkspace = await workspaceService.getWorkspace(
        workspace.id,
        userId
      );

      if (!fullWorkspace) {
        console.error(`Cannot load workspace data for ID: ${workspace.id}`);
        return;
      }

      // Validate workspace to ensure it has the correct structure
      // Using the same validateWorkspace function as in CloudSync
      const validWorkspace = validateWorkspace(fullWorkspace);

      console.log(
        `[DEBUG] Loaded workspace with ${
          validWorkspace.children?.length || 0
        } scenarios`
      );

      // Check if workspace already exists locally
      const existingWorkspace = state.items.find((w) => w.id === workspace.id);

      if (existingWorkspace) {
        // If workspace already exists, replace it with the new one
        // Using the same replaceWorkspace function as in CloudSync
        console.log(`[DEBUG] Replacing existing workspace: ${workspace.id}`);
        replaceWorkspace(validWorkspace, existingWorkspace.id);
      } else {
        // If workspace doesn't exist, add it as new
        // Using the same addWorkspace function as in CloudSync
        console.log(`[DEBUG] Adding new workspace: ${workspace.id}`);
        addWorkspace(validWorkspace);
      }

      // Navigate to workspace page
      const path = workspace.slug
        ? `/${workspace.slug}`
        : `/workspace/${workspace.id}`;
      navigate(path);
    } catch (error) {
      console.error("Error loading workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains unchanged
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <main className="max-w-5xl w-full py-16 px-4 md:px-6">
        {/* Title Section */}
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <Frame />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            REVERT<span className="font-extralight">CONTEXT</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Build sophisticated AI applications with our wizard-style framework
          </p>
        </div>

        <div className="space-y-16">
          {/* Navigation links */}
          <div className="flex justify-center space-x-8 text-sm font-medium">
            <Link
              className="border-b-2 border-primary pb-1 text-foreground transition-colors"
              to="/"
            >
              APPS
            </Link>
            <Link
              className="border-b-2 border-transparent pb-1 text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
              to="/"
            >
              PLUGINS
            </Link>
            <Link
              className="border-b-2 border-transparent pb-1 text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
              to="/"
            >
              DOCUMENTATION
            </Link>
          </div>

          {/* Official workspaces section */}
          <section>
            <div className="flex items-center justify-center mb-8">
              <h2 className="text-2xl font-medium text-center">
                Official Apps
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-muted animate-pulse rounded-lg"
                  ></div>
                ))}
              </div>
            ) : workspaces.length > 0 ? (
              <div className="flex items-center gap-6 justify-center">
                {workspaces.map((workspace) => (
                  <WorkspaceIcon
                    key={workspace.id}
                    workspace={workspace}
                    onClick={() => handleWorkspaceClick(workspace)}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-border bg-card/50 rounded-lg p-8 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center border border-border rounded-full bg-background mb-4">
                  <Package size={24} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg mb-2">No apps available</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Official workspaces will appear here when they become
                  available
                </p>
              </div>
            )}
          </section>

          {/* Features section */}
          <section className="pt-8 border-t border-border">
            <h2 className="text-2xl font-medium text-center mb-12">
              Key Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                  <Layers size={24} className="text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Modular Architecture
                  </h3>
                  <p className="text-muted-foreground">
                    Build complex applications from simple, reusable components
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
                  <Code size={24} className="text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">AI-First Design</h3>
                  <p className="text-muted-foreground">
                    Leverage the latest AI models with our simple integration
                    patterns
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
                  <Database size={24} className="text-violet-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Effortless Scaling
                  </h3>
                  <p className="text-muted-foreground">
                    From prototype to production with confidence and reliability
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Button */}
          <div className="text-center pt-8">
            <Link
              to="/studio"
              className="h-12 rounded-md bg-primary text-primary-foreground px-8 text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus size={18} />
              New App
            </Link>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default FrameworkPage;
