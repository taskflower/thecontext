import { ChevronRight } from "lucide-react";

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
  cfgName,
  wsName,
  currentScenario,
  currentStep,
  currentId,
  pathname,
}: BreadcrumbsProps) {
  const breadcrumbs = [];

  breadcrumbs.push({ label: cfgName, path: `/${cfgName}` });

  if (wsName) {
    breadcrumbs.push({ label: wsName, path: `/${cfgName}/${wsName}` });
  }

  if (currentScenario) {
    breadcrumbs.push({
      label: `📋 ${currentScenario}`,
      path: `/${cfgName}/${wsName}/${currentScenario}`,
    });
  }

  if (currentStep) {
    breadcrumbs.push({
      label: `📝 ${currentStep}`,
      path: `/${cfgName}/${wsName}/${currentScenario}/${currentStep}`,
    });
  }

  if (currentId) {
    breadcrumbs.push({
      label: `🎫 #${currentId}`,
      path: pathname,
    });
  }

  return (
    <div className="px-2 py-1 bg-zinc-50 border-b border-zinc-200">
      <div className="flex items-center space-x-1 text-xs">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-3 h-3 text-zinc-400 mr-1" />
            )}
            <span
              className={`${
                index === breadcrumbs.length - 1
                  ? "text-zinc-900 font-medium"
                  : "text-zinc-600 hover:text-zinc-900 cursor-pointer"
              } border rounded px-2 py-1 bg-white`}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
