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
  LogOut,
  Settings,
  ChevronDown,
  Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useFlow } from "@/core";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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

  const menuItems = [
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

  const isActive = (slug: string) => slug === currentSegment;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center space-x-2 sticky top-0 bg-white">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">G</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">GoldSaver</h2>
        </div>

        {/* Gold price indicator */}
        <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Cena złota (1g)</p>
              <p className="text-lg font-bold text-yellow-700">
                {goldPrice.price} PLN
              </p>
            </div>
            <div
              className={`text-sm font-medium ${
                goldPrice.change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {goldPrice.change >= 0 ? "+" : ""}
              {goldPrice.change}%
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.slug || "home"}
              onClick={() => navigate(item.href)}
              className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors ${
                isActive(item.slug)
                  ? "bg-yellow-100 text-yellow-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span
                className={`mr-3 ${
                  isActive(item.slug) ? "text-yellow-600" : "text-gray-500"
                }`}
              >
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 sticky bottom-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  Jan Kowalski
                </p>
                <p className="text-xs text-gray-500">
                  jan.kowalski@example.com
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="mt-1 py-1 bg-white rounded-lg border border-gray-200 shadow-lg">
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  // Handle settings
                  setIsOpen(false);
                }}
              >
                <Settings className="w-4 h-4 mr-2 text-gray-500" />
                <span>Ustawienia</span>
              </button>

              <button
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  // Handle logout
                  setIsOpen(false);
                  navigate("/");
                }}
              >
                <LogOut className="w-4 h-4 mr-2 text-gray-500" />
                <span>Wyloguj</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="grid grid-cols-5 gap-1">
          {menuItems.slice(0, 5).map((item) => (
            <button
              key={item.slug || "home"}
              onClick={() => navigate(item.href)}
              className={`flex flex-col items-center justify-center p-3 ${
                isActive(item.slug) ? "text-yellow-600" : "text-gray-500"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col ">
        {/* Top navigation */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 py-0.5">
          <div className="flex items-center justify-between px-4 py-3 lg:py-4">
            <div className="flex items-center lg:hidden">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold">G</span>
              </div>
              <h1 className="text-lg font-bold">GoldSaver</h1>
            </div>

            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900">
                {menuItems.find((item) => isActive(item.slug))?.name ||
                  "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.some((n) => n.isNew) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        Powiadomienia
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-2">
                      {notifications.length > 0 ? (
                        <div className="space-y-2">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg ${
                                notification.isNew
                                  ? "bg-blue-50"
                                  : "bg-white hover:bg-gray-50"
                              } transition-colors`}
                            >
                              <p className="font-medium text-sm">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <p>Brak powiadomień</p>
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-200">
                      <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-1">
                        Zobacz wszystkie
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User menu - for small screens */}
              <button className="lg:hidden w-8 h-8 bg-gray-200 rounded-full">
                {/* Avatar image would go here */}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Footer */}
        <footer className="mt-auto bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <p>© 2025 GoldSaver. Wszystkie prawa zastrzeżone.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-700">
                Regulamin
              </a>
              <a href="#" className="hover:text-gray-700">
                Polityka prywatności
              </a>
              <a href="#" className="hover:text-gray-700">
                Kontakt
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
