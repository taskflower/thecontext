// src/modules/edv2/shared/Breadcrumbs.tsx
interface BreadcrumbsProps {
    cfgName: string;
    wsName: string;
    currentScenario?: string;
    currentStep?: string;
    currentId?: string;
    pathname: string;
  }
  
  export function Breadcrumbs({ 
    cfgName, wsName, currentScenario, currentStep, currentId, pathname 
  }: BreadcrumbsProps) {
    const breadcrumbs = [];
    
    breadcrumbs.push({ label: cfgName, path: `/${cfgName}` });
    
    if (wsName) {
      breadcrumbs.push({ label: wsName, path: `/${cfgName}/${wsName}` });
    }
    
    if (currentScenario) {
      breadcrumbs.push({ 
        label: `📋 ${currentScenario}`, 
        path: `/${cfgName}/${wsName}/${currentScenario}` 
      });
    }
    
    if (currentStep) {
      breadcrumbs.push({ 
        label: `📝 ${currentStep}`, 
        path: `/${cfgName}/${wsName}/${currentScenario}/${currentStep}` 
      });
    }
    
    if (currentId) {
      breadcrumbs.push({ 
        label: `🎫 #${currentId}`, 
        path: pathname 
      });
    }
  
    return (
      <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center space-x-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <svg className="w-3 h-3 text-zinc-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span 
                className={`${
                  index === breadcrumbs.length - 1 
                    ? 'text-zinc-900 font-medium' 
                    : 'text-zinc-600 hover:text-zinc-900 cursor-pointer'
                }`}
                onClick={() => {
                  if (index < breadcrumbs.length - 1) {
                    window.open(crumb.path, '_blank');
                  }
                }}
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-xs text-zinc-500 mt-1">
          <span>{pathname}</span>
          <span className="bg-zinc-200 px-2 py-1 rounded">
            Editing: {currentScenario ? `${wsName}/${currentScenario}` : `${cfgName}/${wsName}`}
          </span>
        </div>
      </div>
    );
  }