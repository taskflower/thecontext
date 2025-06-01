// src/modules/configsManager/ConfigsManagerCard.tsx
import React, { useEffect, useState } from "react";
import { X, Cloud, HardDrive, RefreshCw, Upload, Download, Trash2 } from "lucide-react";
import { BaseModal } from "../shared/components/BaseModal";
import { useConfigManager } from "./useConfigManager";


interface ConfigsManagerCardProps {
  onClose: () => void;
}

const ConfigsManagerCard: React.FC<ConfigsManagerCardProps> = ({ onClose }) => {
  const {
    configs,
    loading,
    loadConfigList,
    downloadConfig,
    uploadConfig,
    deleteConfig,
    clearLocalConfig
  } = useConfigManager();

  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);

  useEffect(() => {
    loadConfigList();
  }, [loadConfigList]);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'firebase': return <Cloud size={16} className="text-green-600" />;
      case 'local': return <HardDrive size={16} className="text-blue-600" />;
      case 'both': return <div className="flex gap-1">
        <HardDrive size={12} className="text-blue-600" />
        <Cloud size={12} className="text-green-600" />
      </div>;
      default: return <HardDrive size={16} className="text-gray-400" />;
    }
  };

  const getSourceBadge = (source: string) => {
    const styles = {
      local: 'bg-blue-50 text-blue-700 border-blue-200',
      firebase: 'bg-green-50 text-green-700 border-green-200',
      both: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return `px-2 py-1 text-xs rounded border ${styles[source as keyof typeof styles] || styles.local}`;
  };

  const handleAction = async (action: string, configName: string) => {
    setSelectedConfig(configName);
    try {
      switch (action) {
        case 'upload':
          await uploadConfig(configName);
          break;
        case 'download':
          await downloadConfig(configName);
          break;
        case 'delete':
          if (confirm(`Delete "${configName}" from Firebase?`)) {
            await deleteConfig(configName);
          }
          break;
        case 'clearLocal':
          if (confirm(`Clear local cache for "${configName}"?`)) {
            await clearLocalConfig(configName);
          }
          break;
      }
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
      alert(`Action failed: ${error}`);
    } finally {
      setSelectedConfig(null);
    }
  };

  const isActionLoading = (configName: string) => {
    return loading && selectedConfig === configName;
  };

  return (
    <BaseModal
      title="Configs Manager"
      position={2}
      onClose={onClose}
      icon={<X size={14} />}
    >
      <div className="w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <div className="text-sm text-zinc-600">
            Manage configuration synchronization between local cache and Firebase
          </div>
          <button
            onClick={loadConfigList}
            disabled={loading && !selectedConfig}
            className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading && !selectedConfig ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && configs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={16} className="animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading configurations...</span>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <HardDrive size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No configurations found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {configs.map((config) => (
                <div
                  key={config.name}
                  className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Config Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getSourceIcon(config.source)}
                      <h3 className="font-medium">{config.name}</h3>
                      <span className={getSourceBadge(config.source)}>
                        {config.source}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {config.entriesCount} entries
                    </div>
                  </div>

                  {/* Config Info */}
                  <div className="text-xs text-gray-500 mb-3">
                    Last modified: {config.lastModified.toLocaleString()}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {/* Upload to Firebase */}
                    {config.source !== 'firebase' && (
                      <button
                        onClick={() => handleAction('upload', config.name)}
                        disabled={isActionLoading(config.name)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200 disabled:opacity-50"
                      >
                        <Upload size={12} />
                        {isActionLoading(config.name) ? 'Uploading...' : 'Upload'}
                      </button>
                    )}

                    {/* Download from Firebase */}
                    {config.source !== 'local' && (
                      <button
                        onClick={() => handleAction('download', config.name)}
                        disabled={isActionLoading(config.name)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 disabled:opacity-50"
                      >
                        <Download size={12} />
                        {isActionLoading(config.name) ? 'Downloading...' : 'Download'}
                      </button>
                    )}

                    {/* Clear Local */}
                    {config.source !== 'firebase' && (
                      <button
                        onClick={() => handleAction('clearLocal', config.name)}
                        disabled={isActionLoading(config.name)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 disabled:opacity-50"
                      >
                        <HardDrive size={12} />
                        Clear Local
                      </button>
                    )}

                    {/* Delete from Firebase */}
                    {config.source !== 'local' && (
                      <button
                        onClick={() => handleAction('delete', config.name)}
                        disabled={isActionLoading(config.name)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        Delete Firebase
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t text-xs text-gray-500 space-y-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <HardDrive size={12} />
              Local (IndexedDB)
            </div>
            <div className="flex items-center gap-1">
              <Cloud size={12} />
              Firebase
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw size={12} />
              Auto-sync enabled
            </div>
          </div>
          
          {/* Action Legend */}
          <div className="border-t pt-2 space-y-1">
            <div className="font-medium text-gray-700 mb-1">Actions:</div>
            <div className="">
              <div className="flex items-center gap-1">
                <Upload size={10} className="text-green-600" />
                <span>UPLOAD: Send local to Firebase</span>
              </div>
              <div className="flex items-center gap-1">
                <Download size={10} className="text-blue-600" />
                <span>DOWNLOAD: Pull from Firebase</span>
              </div>
              <div className="flex items-center gap-1">
                <HardDrive size={10} className="text-orange-600" />
                <span>CLEAR LOCAL:Clear local cache</span>
              </div>
              <div className="flex items-center gap-1">
                <Trash2 size={10} className="text-red-600" />
                <span>Delete from Firebase</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfigsManagerCard;