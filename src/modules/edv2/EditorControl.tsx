// src/modules/edv2/EditorControl.tsx - Enhanced for scenario support
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import EditorV2 from './EditorV2';

export default function EditorControlV2() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Don't show on auth pages or in editor pages
  if (location.pathname === '/login' || location.pathname.startsWith('/edit/')) {
    return null;
  }

  // Parse current path to detect context
  const parseCurrentPath = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    return {
      config: parts[0] || 'exampleTicketApp',
      workspace: parts[1] || 'main',
      scenario: parts[2],
      step: parts[3],
      id: parts[4]
    };
  };

  const currentPath = parseCurrentPath();
  const isInScenario = !!currentPath.scenario;
  const isInStep = !!currentPath.step;

  // Determine what's being edited
  const getEditContext = () => {
    if (isInScenario) {
      return {
        type: 'scenario',
        label: `📋 ${currentPath.scenario}`,
        description: `Edit scenario workflow`
      };
    } else {
      return {
        type: 'workspace', 
        label: `🏢 ${currentPath.workspace}`,
        description: `Edit workspace layout & widgets`
      };
    }
  };

  const editContext = getEditContext();

  return (
    <>
      <EditorV2 isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      <div className="fixed bottom-6 right-6 z-40">
        {/* Context indicator */}
        {isOpen && (
          <div className="mb-2 bg-white rounded-lg shadow-lg border border-zinc-200 p-3 w-80 animate-in slide-in-from-bottom-2 duration-200">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Currently Editing</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-zinc-900">{editContext.label}</div>
                <div className="text-sm text-zinc-600">{editContext.description}</div>
              </div>
              <div className="text-2xl">{editContext.type === 'scenario' ? '📋' : '🏢'}</div>
            </div>
            
            {/* Current path info */}
            <div className="mt-2 pt-2 border-t border-zinc-100">
              <div className="text-xs text-zinc-500">Path: {location.pathname}</div>
              <div className="text-xs text-zinc-400">
                Config: {currentPath.config} • Workspace: {currentPath.workspace}
                {currentPath.scenario && ` • Scenario: ${currentPath.scenario}`}
                {currentPath.step && ` • Step: ${currentPath.step}`}
              </div>
            </div>
          </div>
        )}

        {/* Main toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105 ${
            isInScenario 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-zinc-900 hover:bg-zinc-800 text-white'
          }`}
          title={`Configuration Editor - ${editContext.label}`}
        >
          <div className="relative">
            {isInScenario ? (
              // Scenario mode icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            ) : (
              // Workspace mode icon (settings gear)
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            
            {/* Context indicator badge */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              isInScenario ? 'bg-blue-400' : 'bg-orange-400'
            }`} />
          </div>
        </button>

        {/* Quick context indicator (when closed) */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {editContext.label} Editor
          </div>
        )}
      </div>
    </>
  );
}