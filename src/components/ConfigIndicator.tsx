// src/components/ConfigIndicator.tsx
import { Database, File } from 'lucide-react';

interface ConfigIndicatorProps {
  configId: string | null;
  configType: 'local' | 'firebase' | 'documentdb' | null;
  config: any; 
}

const ConfigIndicator: React.FC<ConfigIndicatorProps> = ({ 
  configId, 
  configType,
  config
}) => {
  if (!configId || !configType || !config) return null;

  const isFirebase = configType === 'firebase';
  const isDocumentDB = configType === 'documentdb';
  const Icon = isFirebase ? Database : File;
  const bgColor = isFirebase ? 'bg-blue-100' : isDocumentDB ? 'bg-purple-100' : 'bg-green-100';
  const textColor = isFirebase ? 'text-blue-800' : isDocumentDB ? 'text-purple-800' : 'text-green-800';
  const borderColor = isFirebase ? 'border-blue-200' : isDocumentDB ? 'border-purple-200' : 'border-green-200';
  const label = isFirebase ? 'Firebase App' : isDocumentDB ? 'DocumentDB App' : 'Local Config';

  return (
    <div className={`fixed left-4 bottom-4 z-50 px-3 py-2 text-xs rounded-md ${bgColor} ${textColor} font-semibold flex items-center shadow-md border ${borderColor}`}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      <span>
        {label}: <span className="font-mono">{configId.substring(0, 8)}{configId.length > 8 ? '...' : ''}</span>
        <span className="text-xs opacity-60 ml-2">
          ({config.workspaces.length} ws, {config.scenarios.length} sc)
        </span>
      </span>
    </div>
  );
};

export default ConfigIndicator;