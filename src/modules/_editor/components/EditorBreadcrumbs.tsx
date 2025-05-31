// src/modules/editor/components/EditorBreadcrumbs.tsx
import { useNavigate, useParams } from 'react-router-dom';

interface EditorBreadcrumbsProps {
  configName: string;
  appName?: string;
}

export default function EditorBreadcrumbs({ configName, appName }: EditorBreadcrumbsProps) {
  const { workspace, scenario, type } = useParams();
  const navigate = useNavigate();

  const breadcrumbItems = [
    {
      label: appName || configName,
      href: `/${configName}/${workspace || 'main'}`,
      icon: '🏠',
      isApp: true
    },
    {
      label: 'Editor',
      href: `/edit/${configName}/${workspace || 'main'}/workspace`,
      icon: '⚙️',
      isActive: false
    }
  ];

  if (workspace) {
    breadcrumbItems.push({
      label: workspace,
      href: `/edit/${configName}/${workspace}/workspace`,
      icon: '🏢',
      isActive: type === 'workspace'
    });
  }

  if (scenario) {
    breadcrumbItems.push({
      label: scenario,
      href: `/edit/${configName}/${workspace}/${scenario}/scenario`,
      icon: '📋',
      isActive: type === 'scenario'
    });
  }

  const handleBreadcrumbClick = (href: string, isApp: boolean = false) => {
    if (isApp) {
      // Powrót do aplikacji
      navigate(href);
    } else {
      // Nawigacja w edytorze
      navigate(href);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <svg
              className="w-4 h-4 mx-2 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          
          <button
            onClick={() => handleBreadcrumbClick(item.href, item.isApp)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
              item.isActive
                ? 'bg-blue-100 text-blue-700 font-medium'
                : item.isApp
                ? 'text-zinc-600 hover:bg-zinc-100'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <span className="text-sm">{item.icon}</span>
            <span>{item.label}</span>
            {item.isApp && (
              <span className="text-xs text-zinc-400 ml-1">(app)</span>
            )}
          </button>
        </div>
      ))}
    </nav>
  );
}