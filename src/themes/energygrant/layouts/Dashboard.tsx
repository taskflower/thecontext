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
  ChevronRight,
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
  
  // Pobranie aktualnej ścieżki do aktywacji odpowiedniej pozycji menu
  const currentPath = location.pathname;
  const currentScenario = currentPath.split('/')[2]; // pobieramy część po workspaceSlug

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("beneficjent");

  useEffect(() => {
    const userData = get("user-data");
    if (userData?.role) setUserRole(userData.role);
  }, [get]);

  // Poprawiona funkcja scenarioUrl - usuwa prefix "scenario-"
  const scenarioUrl = (slug: string) => `${basePath}/${slug}/0`;

  const navigationItems = [
    {
      name: "Strona główna",
      slug: "",
      icon: <Home className="h-5 w-5" />,
      href: basePath,
      roles: ["all"] as const,
    },
    ...(userRole === "beneficjent"
      ? [
          {
            name: "Kontakt z Operatorem",
            slug: "contact-operator",
            icon: <Mail className="h-5 w-5" />,
            href: scenarioUrl("contact-operator"),
            roles: ["beneficjent"] as const,
          },
          {
            name: "Wyszukiwarka Wykonawców",
            slug: "find-contractor",
            icon: <Hammer className="h-5 w-5" />,
            href: scenarioUrl("find-contractor"),
            roles: ["beneficjent"] as const,
          },
          {
            name: "Wyszukiwarka Audytorów",
            slug: "find-auditor",
            icon: <ClipboardCheck className="h-5 w-5" />,
            href: scenarioUrl("find-auditor"),
            roles: ["beneficjent"] as const,
          },
          {
            name: "Panel Zleceń",
            slug: "beneficiary-orders",
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
            slug: "contractor-market",
            icon: <Building className="h-5 w-5" />,
            href: scenarioUrl("contractor-market"),
            roles: ["wykonawca"] as const,
          },
          {
            name: "Portfolio",
            slug: "portfolio",
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
            slug: "auditor-market",
            icon: <Clipboard className="h-5 w-5" />,
            href: scenarioUrl("auditor-market"),
            roles: ["audytor"] as const,
          },
          {
            name: "Portfolio",
            slug: "portfolio",
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
            slug: "find-contractor",
            icon: <Hammer className="h-5 w-5" />,
            href: scenarioUrl("find-contractor"),
            roles: ["operator"] as const,
          },
          {
            name: "Wyszukiwarka Audytorów",
            slug: "find-auditor",
            icon: <ClipboardCheck className="h-5 w-5" />,
            href: scenarioUrl("find-auditor"),
            roles: ["operator"] as const,
          },
          {
            name: "Panel Zleceń",
            slug: "beneficiary-orders",
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

  const isActiveMenuItem = (slug: string) => {
    if (slug === "" && currentPath === `/${workspaceSlug}`) return true;
    if (slug && currentScenario === slug) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-96 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-green-700">
            {context?.workspace?.name || "Program Dotacji Energetycznych"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">Panel {userRole}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = isActiveMenuItem(item.slug);
            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.href)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                }`}
              >
                <div className="flex items-center">
                  <span className={`${isActive ? "text-green-600" : "text-gray-400"}`}>
                    {item.icon}
                  </span>
                  <span className={`ml-3 font-medium`}>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-green-600" />}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-xs text-green-700">
              Potrzebujesz pomocy? Skontaktuj się z operatorem programu.
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h2 className="text-lg font-semibold text-green-700">
                {context?.workspace?.name || "Program Dotacji Energetycznych"}
              </h2>
              <p className="text-xs text-gray-500">Panel {userRole}</p>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-green-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <nav className="px-3 pb-4 space-y-1 border-t border-gray-200 pt-2">
              {filteredNav.map((item) => {
                const isActive = isActiveMenuItem(item.slug);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigate(item.href)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors ${
                      isActive
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`${isActive ? "text-green-600" : "text-gray-400"}`}>
                        {item.icon}
                      </span>
                      <span className={`ml-3 font-medium`}>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-green-600" />}
                  </button>
                );
              })}
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