// src/themes/goldsaver/layouts/Dashboard.tsx
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  User,
  CreditCard,
  BarChart2,
  Archive,
  FileText,
  HelpCircle,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useFlow } from "@/core";
import { Sidebar } from "../commons/Sidebar";
import { NavigationConfig } from "../commons/NavigationItem";
import { Header } from "../commons/Header";
import { MobileNavigation } from "../commons/MobileNavigation";
import { Footer } from "../commons/Footer";

// Import common components


const DashboardLayout: React.FC<{
  children: React.ReactNode;
  context?: any;
}> = ({ children, context }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { get } = useFlow();

  const workspaceSlug =
    context?.workspace?.slug || location.pathname.split("/")[1] || "";
  const basePath = `/${workspaceSlug}`;
  const currentSegment = location.pathname.split("/")[2] || "";

  const [, setUserRole] = useState<string>("user");
  const [goldPrice] = useState({ price: 300, change: 1.2 });

  // Mockowane dane powiadomień
  const notifications = [
    {
      id: 1,
      title: "Transakcja zakończona",
      description: "Twój zakup 5g złota został zrealizowany",
      isNew: true,
    },
    {
      id: 2,
      title: "Promocja",
      description: "Tylko dzisiaj: -1% prowizji przy zakupie powyżej 10g",
    },
    {
      id: 3,
      title: "Sztabka gotowa do odbioru",
      description: "Twoja sztabka 10g jest gotowa do odbioru",
    },
  ];

  useEffect(() => {
    const ud = get("user-data");
    if (ud?.role) setUserRole(ud.role);
  }, [get]);

  // Navigation configuration
  const menuItems: NavigationConfig[] = [
    {
      name: "Strona główna",
      slug: "",
      icon: <Home className="w-5 h-5" />,
      href: basePath,
    },
    {
      name: "Panel użytkownika",
      slug: "user-panel",
      icon: <User className="w-5 h-5" />,
      href: `${basePath}/user-panel/0`,
    },
    {
      name: "Zakup złota",
      slug: "purchase-gold",
      icon: <CreditCard className="w-5 h-5" />,
      href: `${basePath}/purchase-gold/0`,
    },
    {
      name: "Sprzedaż złota",
      slug: "sell-gold",
      icon: <DollarSign className="w-5 h-5" />,
      href: `${basePath}/sell-gold/0`,
    },
    {
      name: "Historia transakcji",
      slug: "transaction-history",
      icon: <Archive className="w-5 h-5" />,
      href: `${basePath}/transaction-history/0`,
    },
    {
      name: "Analizy i wykresy",
      slug: "analytics-dashboard",
      icon: <BarChart2 className="w-5 h-5" />,
      href: `${basePath}/analytics-dashboard/0`,
    },
    {
      name: "Sztabki i monety",
      slug: "bars-management",
      icon: <Archive className="w-5 h-5" />,
      href: `${basePath}/bars-management/0`,
    },
    {
      name: "Wymiana monet",
      slug: "coins-exchange",
      icon: <RefreshCw className="w-5 h-5" />,
      href: `${basePath}/coins-exchange/0`,
    },
    {
      name: "Faktury",
      slug: "invoices",
      icon: <FileText className="w-5 h-5" />,
      href: `${basePath}/invoices/0`,
    },
    {
      name: "Pomoc",
      slug: "support-center",
      icon: <HelpCircle className="w-5 h-5" />,
      href: `${basePath}/support-center/0`,
    },
  ];

  // Event handlers
  const handleLogout = () => {
    // Handle logout logic
    navigate("/");
  };

  const handleSettings = () => {
    // Handle settings logic
  };

  const handleViewAllNotifications = () => {
    // Handle view all notifications logic
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - desktop */}
      <Sidebar
        menuItems={menuItems}
        currentSegment={currentSegment}
        navigateTo={navigate}
        goldPrice={goldPrice}
        onSettings={handleSettings}
        onLogout={handleLogout}
      />

      {/* Mobile navigation */}
      <MobileNavigation
        menuItems={menuItems}
        currentSegment={currentSegment}
        navigateTo={navigate}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top navigation */}
        <Header
          menuItems={menuItems}
          currentSegment={currentSegment}
          notifications={notifications}
          onViewAllNotifications={handleViewAllNotifications}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;