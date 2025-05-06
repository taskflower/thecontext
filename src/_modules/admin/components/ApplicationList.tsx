// src/_modules/admin/components/ApplicationList.tsx
import React, { useState } from "react";
import { Application } from "@/types";
import { applicationService } from "@/_firebase/services";
import { Database, RefreshCw, Trash2 } from "lucide-react";

interface ApplicationListProps {
  applications: Application[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

const ApplicationList: React.FC<ApplicationListProps> = ({ 
  applications, 
  isLoading, 
  onRefresh 
}) => {
  const [error, setError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Handle application delete
  const handleDeleteApp = async (appId: string) => {
    // If not yet confirmed, set the confirm state
    if (confirmDeleteId !== appId) {
      setConfirmDeleteId(appId);
      return;
    }
    
    try {
      setDeleteInProgress(appId);
      setConfirmDeleteId(null);

      // Use the service to delete the application and related data
      await applicationService.delete(appId);

      // Refresh the list
      await onRefresh();
    } catch (err) {
      console.error("Error deleting application:", err);
      setError(
        `Delete error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setDeleteInProgress(null);
    }
  };

  // Cancel delete confirmation
  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-medium flex items-center text-gray-800">
          <Database className="w-4 h-4 mr-2 text-blue-600" />
          Applications List ({applications.length})
        </h3>
      </div>
      
      <div className="p-0.5 max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center p-6 text-gray-500 text-sm">
            No applications in the database
          </div>
        ) : (
          <div className="space-y-0.5">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className="p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm text-gray-800">
                      {app.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {app.description || "No description"}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <div>
                        ID: <span className="font-mono">{app.id}</span>
                      </div>
                      <div>
                        Created: {formatDate(app.createdAt ?? new Date())}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {confirmDeleteId === app.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDeleteApp(app.id)}
                          disabled={deleteInProgress === app.id}
                          className="p-1.5 rounded-md bg-red-600 text-white text-xs hover:bg-red-700 transition-colors disabled:bg-red-300"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="p-1.5 rounded-md bg-gray-200 text-gray-700 text-xs hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        disabled={deleteInProgress === app.id}
                        className="p-1.5 rounded-md hover:bg-red-100 text-red-600 transition-colors disabled:text-red-300 flex items-center"
                      >
                        {deleteInProgress === app.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {error && (
          <div className="m-3 p-2 bg-red-50 text-red-700 border border-red-100 rounded-md text-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationList;