// src/themes/energygrant/layouts/Dashboard.tsx
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Hammer,
  ClipboardCheck,
  Building,
  Clipboard,
  Folder,
  User,
  Menu,
  X,
  Home,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useFlow } from "@/core";

interface LayoutContext {
  workspace?: { slug: string; name?: string };
  scenario?: { slug: string };
  stepIdx?: number;
  totalSteps?: number;
  transitioning?: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  context?: LayoutContext;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  context,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { get } = useFlow();

  const workspaceSlug =
    context?.workspace?.slug ||
    location.pathname.split("/").filter(Boolean)[0] ||
    "";
  const basePath = `/${workspaceSlug}`;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("beneficjent");

  useEffect(() => {
    const userData = get("user-data");
    if (userData?.role) setUserRole(userData.role);
  }, [get]);

  const scenarioUrl = (slug: string) => `${basePath}/scenario-${slug}/0`;

  const navigationItems = [
    {
      name: "Strona główna",
      icon: <Home className="h-5 w-5" />,
      href: basePath,
      roles: ["all"] as const,
    },
    ...(userRole === "beneficjent"
      ? [
          {
            name: "Kontakt z Operatorem",
            icon: <Mail className="h-5 w-5" />,
            href: scenarioUrl("contact-operator"),
            roles: ["beneficjent"] as const,
          },
          {
            name: "Wyszukiwarka Wykonawców",
            icon: <Hammer className="h-5 w-5" />,
            href: scenarioUrl("find-contractor"),
            roles: ["beneficjent"] as const,
          },
          {
            name: "Wyszukiwarka Audytorów",
            icon: <ClipboardCheck className="h-5 w-5" />,
            href: scenarioUrl("find-auditor"),
            roles: ["beneficjent"] as const,
          },
          {
            name: "Panel Zleceń",
            icon: <Folder className="h-5 w-5" />,
            href: scenarioUrl("beneficiary-orders"),
            roles: ["beneficjent"] as const,
          },
        ]
      : []),
    ...(userRole === "wykonawca"
      ? [
          {
            name: "Giełda Wykonawców",
            icon: <Building className="h-5 w-5" />,
            href: scenarioUrl("contractor-market"),
            roles: ["wykonawca"] as const,
          },
          {
            name: "Portfolio",
            icon: <User className="h-5 w-5" />,
            href: scenarioUrl("portfolio"),
            roles: ["wykonawca"] as const,
          },
        ]
      : []),
    ...(userRole === "audytor"
      ? [
          {
            name: "Giełda Audytorów",
            icon: <Clipboard className="h-5 w-5" />,
            href: scenarioUrl("auditor-market"),
            roles: ["audytor"] as const,
          },
          {
            name: "Portfolio",
            icon: <User className="h-5 w-5" />,
            href: scenarioUrl("portfolio"),
            roles: ["audytor"] as const,
          },
        ]
      : []),
    ...(userRole === "operator"
      ? [
          {
            name: "Wyszukiwarka Wykonawców",
            icon: <Hammer className="h-5 w-5" />,
            href: scenarioUrl("find-contractor"),
            roles: ["operator"] as const,
          },
          {
            name: "Wyszukiwarka Audytorów",
            icon: <ClipboardCheck className="h-5 w-5" />,
            href: scenarioUrl("find-auditor"),
            roles: ["operator"] as const,
          },
          {
            name: "Panel Zleceń",
            icon: <Folder className="h-5 w-5" />,
            href: scenarioUrl("beneficiary-orders"),
            roles: ["operator"] as const,
          },
        ]
      : []),
  ];

  const filteredNav = navigationItems.filter(
    (item: any) =>
      item.roles.includes("all") || item.roles.includes(userRole as any)
  );

  const handleNavigate = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  // const getRoleLabel = () =>
  //   ({
  //     beneficjent: "Beneficjent",
  //     wykonawca: "Wykonawca",
  //     audytor: "Audytor",
  //     operator: "Operator programu",
  //   }[userRole] || "Użytkownik");

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-green-700">
            {context?.workspace?.name || "Program Dotacji Energetycznych"}
          </h2>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigate(item.href)}
              className="w-full flex items-center px-3 py-2 text-gray-700 hover:text-green-700 hover:bg-gray-100 rounded"
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-lg font-semibold text-green-700">
              {context?.workspace?.name || "Program Dotacji Energetycznych"}
            </h2>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <nav className="px-2 pb-4 space-y-1">
              {filteredNav.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.href)}
                  className="w-full flex items-center px-3 py-2 text-gray-700 hover:text-green-700 hover:bg-gray-100 rounded"
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </button>
              ))}
            </nav>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="text-center text-xs text-gray-500">
            © 2025 Program Dotacji Energetycznych. Wszystkie prawa zastrzeżone.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
