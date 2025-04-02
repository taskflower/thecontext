import WorkspaceIcon from "@/components/frameworkLanding/WorkspaceIcon";
import { AppFooter } from "@/components/frontApp";
import { db } from "@/firebase/config";
import { WorkspaceStorageItem } from "@/services/WorkspaceService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Package, Layers, Code, Database, Plus, Frame } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const FrameworkPage: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<WorkspaceStorageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

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

        const officialWorkspaces: WorkspaceStorageItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as WorkspaceStorageItem;
          officialWorkspaces.push({
            ...data,
            id: doc.id,
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

  const handleWorkspaceClick = (workspace: WorkspaceStorageItem) => {
    // Navigate to the workspace using React Router
    const path = workspace.slug
      ? `/${workspace.slug}`
      : `/workspace/${workspace.id}`;
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <main className="max-w-5xl w-full py-16 px-4 md:px-6">
        {/* Title Section - New York Style with emphasis */}
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
          {/* Navigation links - centered */}
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

          {/* Recent workspaces section */}
          {/* <section>
            <div className="flex items-center justify-center mb-8">
              <h2 className="text-2xl font-medium">Recent Workspaces</h2>
            </div>

            <div className="border border-border rounded-lg divide-y divide-border">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="p-6 flex items-center hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="h-12 w-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mr-6 text-primary">
                    <Code size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Example Workspace {index + 1}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last edited: today
                    </p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    2 components
                  </div>
                </div>
              ))}
            </div>
          </section> */}

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
            <button className="h-12 rounded-md bg-primary text-primary-foreground px-8 text-sm font-medium inline-flex items-center gap-2">
              <Plus size={18} />
              New App
            </button>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default FrameworkPage;
