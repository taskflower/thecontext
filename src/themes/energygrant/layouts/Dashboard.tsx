// src/themes/energygrant/layouts/Dashboard.tsx
import { useLocation, useParams } from 'react-router-dom';
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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFlow } from '@/core';
import { useConfig } from '@/ConfigProvider';
import { useAppNavigation } from '@/core/navigation';

interface LayoutContext {
  workspace?: { slug: string; name?: string };
  scenario?: { slug: string };
  stepIdx?: number;
  totalSteps?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  context?: LayoutContext;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, context }) => {
  const location = useLocation();
  const { get } = useFlow();
  const { configId } = useConfig();
  const params = useParams<any>();
  const workspaceSlug = context?.workspace?.slug || params.workspaceSlug || '';
  const { toWorkspace, toScenarioStep } = useAppNavigation();

  const currentPath = location.pathname;
  const currentScenario = params.scenarioSlug || currentPath.split('/')[2] || '';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<any>('beneficjent');

  useEffect(() => {
    const userData = get('user-data');
    if (userData?.role) setUserRole(userData.role);
  }, [get]);

  const navItem = (name: string, slug: string, icon: React.ReactNode, roles: readonly string[]) => ({
    name,
    slug,
    icon,
    onClick: () => toScenarioStep(workspaceSlug, slug, 0),
    roles,
  });

  const navigationItems = [
    {
      name: 'Strona główna',
      slug: '',
      icon: <Home className="h-5 w-5" />, 
      onClick: () => toWorkspace(workspaceSlug),
      roles: ['all'] as const,
    },
    ...(userRole === 'beneficjent'
      ? [
          navItem('Kontakt z Operatorem', 'contact-operator', <Mail className="h-5 w-5" />, ['beneficjent']),
          navItem('Wyszukiwarka Wykonawców', 'find-contractor', <Hammer className="h-5 w-5" />, ['beneficjent']),
          navItem('Wyszukiwarka Audytorów', 'find-auditor', <ClipboardCheck className="h-5 w-5" />, ['beneficjent']),
          navItem('Panel Zleceń', 'beneficiary-orders', <Folder className="h-5 w-5" />, ['beneficjent']),
        ]
      : []),
    ...(userRole === 'wykonawca'
      ? [
          navItem('Giełda Wykonawców', 'contractor-market', <Building className="h-5 w-5" />, ['wykonawca']),
          navItem('Portfolio', 'portfolio', <User className="h-5 w-5" />, ['wykonawca']),
        ]
      : []),
    ...(userRole === 'audytor'
      ? [
          navItem('Giełda Audytorów', 'auditor-market', <Clipboard className="h-5 w-5" />, ['audytor']),
          navItem('Portfolio', 'portfolio', <User className="h-5 w-5" />, ['audytor']),
        ]
      : []),
    ...(userRole === 'operator'
      ? [
          navItem('Wyszukiwarka Wykonawców', 'find-contractor', <Hammer className="h-5 w-5" />, ['operator']),
          navItem('Wyszukiwarka Audytorów', 'find-auditor', <ClipboardCheck className="h-5 w-5" />, ['operator']),
          navItem('Panel Zleceń', 'beneficiary-orders', <Folder className="h-5 w-5" />, ['operator']),
        ]
      : []),
  ];

  const filteredNav = navigationItems.filter(
    (item) => item.roles.includes('all') || item.roles.includes(userRole)
  );

  const handleNavigate = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  const isActiveMenuItem = (slug: string) => {
    if (slug === '' && currentPath === `/${configId}/${workspaceSlug}`) return true;
    if (slug && currentScenario === slug) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-96 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-green-700">
            {context?.workspace?.name || 'Program Dotacji Energetycznych'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">Panel {userRole}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const active = isActiveMenuItem(item.slug);
            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.onClick)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors ${
                  active
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                }`}
              >
                <div className="flex items-center">
                  <span className={`${active ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  <span className="ml-3 font-medium">{item.name}</span>
                </div>
                {active && <ChevronRight className="h-4 w-4 text-green-600" />}
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
        <header className="bg-white shadow-sm border-b border-gray-200 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h2 className="text-lg font-semibold text-green-700">
                {context?.workspace?.name || 'Program Dotacji Energetycznych'}
              </h2>
              <p className="text-xs text-gray-500">Panel {userRole}</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-green-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {isMobileMenuOpen && (
            <nav className="px-3 pb-4 space-y-1 border-t border-gray-200 pt-2">
              {filteredNav.map((item) => {
                const active = isActiveMenuItem(item.slug);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigate(item.onClick)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors ${
                      active
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`${active ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.icon}
                      </span>
                      <span className="ml-3 font-medium">{item.name}</span>
                    </div>
                    {active && <ChevronRight className="h-4 w-4 text-green-600" />}
                  </button>
                );
              })}
            </nav>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
        </main>

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