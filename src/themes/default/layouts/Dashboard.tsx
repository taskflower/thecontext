// src/themes/default/layouts/Dashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutGrid, 
  BarChart3, 
  Search, 
  Settings, 
  ChevronDown,
  Menu,
  X,
  Bell
} from "lucide-react";
import { useAuth } from "../../../auth/useAuth";

interface LayoutContext {
  workspace: any;
  scenario?: any;
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
  context 
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workspace } = context || {};
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const navigationItems = [
    { 
      name: 'Dashboard', 
      icon: <LayoutGrid className="h-5 w-5" />, 
      href: `/${workspace?.slug || ''}` 
    },
    { 
      name: 'Kampanie', 
      icon: <BarChart3 className="h-5 w-5" />, 
      href: `/${workspace?.slug || ''}/campaigns` 
    },
    { 
      name: 'Ustawienia', 
      icon: <Settings className="h-5 w-5" />, 
      href: `/${workspace?.slug || ''}/settings` 
    },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  
  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Górny pasek */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo i przyciski nawigacyjne */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-lg font-semibold text-gray-900">
                  {workspace?.name || 'Google Ads'}
                </span>
              </div>
              
              {/* Nawigacja na dużych ekranach */}
              <nav className="hidden md:ml-8 md:flex md:space-x-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Przyciski prawej strony */}
            <div className="flex items-center">
              {/* Wyszukiwarka */}
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Szukaj..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
              </div>
              
              {/* Dzwonek powiadomień */}
              <button className="ml-4 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none">
                <Bell className="h-5 w-5" />
              </button>
              
              {/* Profil użytkownika */}
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <span className="sr-only">Otwórz menu użytkownika</span>
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      {user?.displayName?.[0] || 'U'}
                    </div>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </button>
                </div>
                
                {/* Menu użytkownika */}
                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <div className="block px-4 py-2 text-sm text-gray-900 border-b border-gray-100">
                        <p className="font-medium">{user?.displayName || 'Użytkownik'}</p>
                        <p className="text-gray-500 text-xs mt-1">{user?.email || ''}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/${workspace?.slug || ''}/profile`)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profil
                      </button>
                      <button 
                        onClick={() => navigate(`/${workspace?.slug || ''}/settings`)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Ustawienia
                      </button>
                      <button 
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Wyloguj
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Menu mobilne */}
              <div className="flex md:hidden ml-3">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
                >
                  <span className="sr-only">Otwórz menu główne</span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu mobilne */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1 px-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium w-full"
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </button>
              ))}
              
              {/* Wyszukiwarka w menu mobilnym */}
              <div className="relative mt-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Szukaj..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Główna zawartość */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      {/* Stopka */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500">
            &copy; 2025 Google Ads Manager. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;