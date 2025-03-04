// src/layouts/AdminSidebar.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, FileText,  CheckSquare } from "lucide-react";
import { AppLink } from "@/components/common/AppLink";

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  isActivePath: boolean;
}

const MobileNavLink: React.FC<SidebarLinkProps> = ({
  to,
  icon: Icon,
  children,
  isActivePath,
}) => (
  <AppLink
    to={to}
    admin
    className={`flex flex-col items-center justify-center w-full h-full p-2 ${
      isActivePath ? "text-black" : "text-gray-500"
    } active:bg-gray-100`}
  >
    <Icon className={`h-6 w-6 ${isActivePath ? "text-black" : "text-gray-500"}`} />
    <span className="text-xs mt-1">{children}</span>
  </AppLink>
);

const DesktopSidebarLink: React.FC<SidebarLinkProps> = ({
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
    <AppLink to={to} admin className="flex items-center w-full">
      <Icon className="mr-2 h-5 w-5" />
      {children}
    </AppLink>
  </Button>
);

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    // Przykładowo: /admin/en/documents/projects -> ['', 'admin', 'en', 'documents', 'projects']
    const pathSegments = location.pathname.split('/');
    // Zakładamy, że segment odpowiedzialny za stronę znajduje się na pozycji 3
    const activeSection = pathSegments[3]; 
    // Porównujemy z nazwą sekcji (usuwamy początkowy "/")
    return activeSection === path.replace('/', '');
  };

  const navigationItems = [
    { path: "/scenarios", icon: CheckSquare, label: "Scenarios" },
    { path: "/tasks", icon: CheckSquare, label: "Tasks" },
    { path: "/documents", icon: FileText, label: "Documents" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  // Mobile bottom navigation
  const mobileNav = (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-30">
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item) => (
          <MobileNavLink
            key={item.path}
            to={item.path}
            icon={item.icon}
            isActivePath={isActive(item.path)}
          >
            {item.label}
          </MobileNavLink>
        ))}
      </div>
    </nav>
  );

  // Desktop sidebar
  const desktopNav = (
    <div className="hidden md:block w-full md:h-screen md:max-w-full lg:max-w-lg border-r bg-background md:sticky md:top-0">
      <div className="space-y-4 p-4 md:px-8 lg:px-12 md:w-72 lg:w-96 md:ml-auto">
        <h2 className="mb-4 md:mb-12 lg:mb-17 px-4 text-lg font-semibold">
          &nbsp;
        </h2>
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <DesktopSidebarLink
              key={item.path}
              to={item.path}
              icon={item.icon}
              isActivePath={isActive(item.path)}
            >
              {item.label}
            </DesktopSidebarLink>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {desktopNav}
      {mobileNav}
    </>
  );
};