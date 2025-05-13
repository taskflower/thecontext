// src/themes/goldsaver/layouts/Dashboard.tsx
import { useLocation, useParams } from "react-router-dom";
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
import { useFlow, useAppNavigation } from "@/core"; // Dodajemy import useAppNavigation
import { useConfig } from "@/ConfigProvider";
import { Sidebar } from "../commons/Sidebar";
import { NavigationConfig } from "../commons/NavigationItem";
import { Header } from "../commons/Header";
import { MobileNavigation } from "../commons/MobileNavigation";
import { Footer } from "../commons/Footer";

const DashboardLayout: React.FC<{
  children: React.ReactNode;
  context?: any;
}> = ({ children, context }) => {
  // Zamieniamy useNavigate na useAppNavigation
  const { toWorkspace, toScenarioList, toScenarioStep } = useAppNavigation();
  const location = useLocation();
  const params = useParams<{ workspaceSlug: string }>();
  const { get } = useFlow();
  const { configId } = useConfig();

  const workspaceSlug = context?.workspace?.slug || params.workspaceSlug || "";
  const basePath = `/${configId}/${workspaceSlug}`;
  const currentSegment = location.pathname.split("/")[3] || "";

  const [, setUserRole] = useState<string>("user");
  const [goldPrice] = useState({ price: 300, change: 1.2 });

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

  // Zaktualizowane handlery używające nawigacji z core
  const handleLogout = () => toWorkspace("");  // Przekierowanie do strony głównej
  const handleSettings = () => {};
  const handleViewAllNotifications = () => {};

  // Funkcja do nawigacji, która będzie przekazana do Sidebar i MobileNavigation
  const navigateTo = (path: string) => {
    // Sprawdzamy czy ścieżka zawiera scenariusz i krok
    const parts = path.split('/');
    const scenarioIndex = parts.findIndex((part, index) => index > 2 && part !== "0");
    
    if (scenarioIndex > 2) {
      // Mamy scenariusz i krok
      const scenarioSlug = parts[scenarioIndex];
      const stepIndex = parseInt(parts[scenarioIndex + 1] || "0");
      toScenarioStep(workspaceSlug, scenarioSlug, stepIndex);
    } else {
      // Nawigacja do listy scenariuszy w workspace
      toScenarioList(workspaceSlug);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        menuItems={menuItems}
        currentSegment={currentSegment}
        navigateTo={navigateTo}
        goldPrice={goldPrice}
        onSettings={handleSettings}
        onLogout={handleLogout}
      />
      <MobileNavigation
        menuItems={menuItems}
        currentSegment={currentSegment}
        navigateTo={navigateTo}
      />
      <div className="flex-1 flex flex-col">
        <Header
          menuItems={menuItems}
          currentSegment={currentSegment}
          notifications={notifications}
          onViewAllNotifications={handleViewAllNotifications}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;