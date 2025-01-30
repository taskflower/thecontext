import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, FileText, ListTodo, Route } from "lucide-react"; // Import ikon Lucide

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  isActivePath: boolean;
}

// Nowy komponent SidebarLink
const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon: Icon,
  children,
  isActivePath,
}) => (
  <Button
    variant="ghost"
    className={`w-full justify-start ${
      isActivePath
        ? "bg-black text-white hover:bg-black hover:text-white"
        : "hover:bg-gray-100 hover:text-black"
    }`}
    asChild
  >
    <Link to={to} className="flex items-center w-full">
      <Icon className="mr-2 h-5 w-5" />
      {children}
    </Link>
  </Button>
);

export const AdminSidebar = () => {
  const location = useLocation();

  // Funkcja pomocnicza do sprawdzania, czy ścieżka jest aktywna
  const isActive = (path: string): boolean => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen w-full max-w-lg border-r bg-background sticky top-0">
      <div className="space-y-4 px-12 w-96 ml-auto ">
        
          <h2 className="mb-17 px-4 text-lg font-semibold">&nbsp;</h2>
          <div className="space-y-1">
            <SidebarLink
              to="/admin/boards/instances"
              icon={Route}
              isActivePath={isActive("/admin/boards")}
            >
              Boards
            </SidebarLink>
            <SidebarLink
              to="/admin/tasks/templates"
              icon={ListTodo}
              isActivePath={isActive("/admin/tasks")}
            >
              Tasks
            </SidebarLink>
            <SidebarLink
              to="/admin/documents"
              icon={FileText}
              isActivePath={isActive("/admin/documents")}
            >
              Documents
            </SidebarLink>
            <SidebarLink
              to="/admin/settings"
              icon={Settings}
              isActivePath={isActive("/admin/settings")}
            >
              Settings
            </SidebarLink>
          </div>
     
      </div>
    </div>
  );
};
