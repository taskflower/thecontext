// src/pages/RedirectToDefault.tsx 
// Redirects root URL to default workspace or scenario/node
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const DEFAULT_CONFIG = "roleTestApp";

export default function RedirectToDefault() {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadDefaultUrl = async () => {
      try {
        const response = await fetch(`/src/_configs/${DEFAULT_CONFIG}/app.json`);
        const appConfig = await response.json();
        
        const workspace = appConfig.defaultWorkspace || "default";
        
        if (appConfig.defaultScenario) {
          // Scenario mode: /:config/:workspace/:scenario/:node
          const [scenario, node] = appConfig.defaultScenario.split('/');
          const finalNode = node || "view"; // fallback if no node specified
          setRedirectUrl(`/${DEFAULT_CONFIG}/${workspace}/${scenario}/${finalNode}`);
        } else {
          // Workspace mode: /:config/:workspace
          setRedirectUrl(`/${DEFAULT_CONFIG}/${workspace}`);
        }
      } catch (err) {
        // Fallback to workspace mode
        setRedirectUrl(`/${DEFAULT_CONFIG}/default`);
      }
    };

    loadDefaultUrl();
  }, []);

  if (!redirectUrl) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <Navigate to={redirectUrl} replace />;
}