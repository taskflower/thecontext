// src/modules/editor/components/EditorControl.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function EditorControl() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { config, workspace, scenario } = useParams();

  // Pokazuj kontrolkę tylko gdy nie jesteśmy w trybie edycji
  const isInEditor = location.pathname.startsWith('/edit/');
  const isOnLoginPage = location.pathname === '/login';

  // Określ aktualny config (domyślny lub z URL)
  const currentConfig = config || 'exampleTicketApp';
  const currentWorkspace = workspace || 'main';

  useEffect(() => {
    // Pokaż kontrolkę natychmiast, ale tylko jeśli nie jesteśmy w editorze
    if (!isInEditor && !isOnLoginPage) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isInEditor, isOnLoginPage]);

  const handleEditWorkspace = () => {
    console.log('handleEditWorkspace clicked', { config: currentConfig, workspace: currentWorkspace });
    const path = `/edit/${currentConfig}/${currentWorkspace}/workspace`;
    console.log('Navigating to:', path);
    navigate(path);
  };

  const handleEditScenario = () => {
    console.log('handleEditScenario clicked', { config: currentConfig, workspace: currentWorkspace, scenario });
    if (scenario) {
      const path = `/edit/${currentConfig}/${currentWorkspace}/${scenario}/scenario`;
      console.log('Navigating to:', path);
      navigate(path);
    }
  };

  const handleCreateWorkspace = () => {
    console.log('handleCreateWorkspace clicked', { config: currentConfig });
    // Przejdź do edycji z prefiksem "new-" żeby oznaczyć nowy workspace
    const newWorkspaceName = `new-workspace-${Date.now()}`;
    const path = `/edit/${currentConfig}/${newWorkspaceName}/workspace`;
    console.log('Navigating to create workspace:', path);
    navigate(path);
  };

  const handleCreateScenario = () => {
    console.log('handleCreateScenario clicked', { config: currentConfig, workspace: currentWorkspace });
    // Utwórz nowy scenariusz w aktualnym workspace
    const newScenarioName = `new-scenario-${Date.now()}`;
    const path = `/edit/${currentConfig}/${currentWorkspace}/${newScenarioName}/scenario`;
    console.log('Navigating to create scenario:', path);
    navigate(path);
  };

  const handleViewConfig = () => {
    setIsExpanded(!isExpanded);
  };

  const backToApp = () => {
    // Wróć do głównej aplikacji zachowując kontekst
    if (config && workspace) {
      navigate(`/${config}/${workspace}`);
    } else {
      navigate('/');
    }
  };

  if (!isVisible || isOnLoginPage) {
    return null;
  }

  // Jeśli jesteśmy w editorze, pokaż tylko przycisk powrotu
  if (isInEditor) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={backToApp}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
          title="Back to App"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Main Control */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Expanded Panel */}
        {isExpanded && (
          <div className="mb-4 bg-white rounded-lg shadow-xl border border-zinc-200 p-4 w-80 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-900">🛠️ Configuration Editor</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Current Location */}
              <div className="text-xs text-zinc-500 border-b border-zinc-100 pb-2">
                <div>Config: <span className="font-mono">{currentConfig}</span></div>
                <div>Workspace: <span className="font-mono">{currentWorkspace}</span></div>
                {scenario && <div>Scenario: <span className="font-mono">{scenario}</span></div>}
              </div>

              {/* Edit Current Context */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Edit Current</div>
                
                <button
                  onClick={handleEditWorkspace}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-md border border-zinc-200 transition-colors"
                >
                  <div className="font-medium">✏️ Edit This Workspace</div>
                  <div className="text-xs text-zinc-500">Modify "{currentWorkspace}" widgets & schema</div>
                </button>
                
                {scenario && (
                  <button
                    onClick={handleEditScenario}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-md border border-zinc-200 transition-colors"
                  >
                    <div className="font-medium">📋 Edit This Scenario</div>
                    <div className="text-xs text-zinc-500">Modify "{scenario}" workflow steps</div>
                  </button>
                )}
              </div>

              {/* Create New */}
              <div className="space-y-2 border-t border-zinc-100 pt-3">
                <div className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Create New</div>
                
                <button
                  onClick={handleCreateWorkspace}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-md border border-zinc-200 transition-colors"
                >
                  <div className="font-medium">➕ New Workspace</div>
                  <div className="text-xs text-zinc-500">Create a new workspace in "{currentConfig}"</div>
                </button>

                <button
                  onClick={handleCreateScenario}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-md border border-zinc-200 transition-colors"
                >
                  <div className="font-medium">📄 New Scenario</div>
                  <div className="text-xs text-zinc-500">Add scenario to "{currentWorkspace}" workspace</div>
                </button>
              </div>

              {/* AI Assistant */}
              <div className="border-t border-zinc-100 pt-3">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-md p-3">
                  <div className="text-xs font-medium text-zinc-800 mb-1">🤖 AI Assistant Available</div>
                  <div className="text-xs text-zinc-600">Generate configs with natural language</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={handleViewConfig}
          className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105 group"
          title="Configuration Editor"
        >
          <div className="relative">
            <svg 
              className="w-6 h-6 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            
            {/* Notification Badge */}
            {(workspace || scenario) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
        </button>

        {/* Minimized Hint */}
        {!isExpanded && (
          <div className="absolute bottom-full right-0 mb-2 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Configuration Editor
          </div>
        )}
      </div>
    </>
  );
}