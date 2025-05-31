// src/modules/appTree/AppTreeCard.tsx - Main card component
import React from 'react';
import { X, TreePine } from 'lucide-react';
import AppTreeView from './components/AppTreeView';

interface AppTreeCardProps {
  onClose: () => void;
  configName?: string;
}

const AppTreeCard: React.FC<AppTreeCardProps> = ({ onClose, configName = 'exampleTicketApp' }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />
      
      {/* Card */}
      <div className="fixed left-6 top-10 z-50 w-92 bg-white rounded-lg shadow-xl border border-zinc-200 h-[90vh] flex flex-col animate-in slide-in-from-left-2">
        {/* Header */}
        <div className="p-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
              <TreePine size={14} />
              Application Tree
            </h3>
            <p className="text-xs text-zinc-500 truncate">
              {configName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded hover:bg-zinc-100"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AppTreeView configName={configName} />
        </div>
      </div>
    </>
  );
};

export default AppTreeCard;