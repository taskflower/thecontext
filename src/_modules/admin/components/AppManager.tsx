// src/_modules/admin/components/AppManager.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { applicationService, importService } from "@/_firebase/services";
import { Application } from "@/types";
import { Database, FileJson, Trash2, RefreshCw, Check, X } from "lucide-react";

const AppManager: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { user } = useAuth();

  // Fetch applications list
  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const appList = await applicationService.getAll();
      setApplications(appList);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to fetch applications list");
    } finally {
      setIsLoading(false);
    }
  };

  // Load list on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle JSON file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setJsonFile(file);
    setUploadSuccess(null);
    
    if (file) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        setFileContent(data);
      } catch (err) {
        console.error("Error parsing JSON file:", err);
        setError("Invalid JSON file format");
        setFileContent(null);
      }
    } else {
      setFileContent(null);
    }
  };

  // Handle data import from JSON
  const handleImport = async () => {
    if (!jsonFile || !user) return;

    try {
      setIsUploading(true);
      setError(null);
      setUploadSuccess(null);

      // Using the pre-parsed content
      if (!fileContent || !Array.isArray(fileContent)) {
        throw new Error("Invalid data format. Expected an array of applications.");
      }

      // Import data to Firebase
      const result = await importService.seedFirestoreFromData(
        user.uid,
        fileContent
      );

      setUploadSuccess(
        `Successfully imported data. Application ID: ${result.applicationId}`
      );

      // Refresh applications list
      await fetchApplications();
    } catch (err) {
      console.error("Error importing data:", err);
      setError(
        `Import error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Handle application delete
  const handleDeleteApp = async (appId: string) => {
    if (!user) return;
    
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
      await fetchApplications();
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
    <div className="p-4 h-full overflow-auto">
      <div className="flex flex-col space-y-4 h-full">
        {/* File Upload Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <h3 className="text-sm font-medium flex items-center text-gray-800">
              <FileJson className="w-4 h-4 mr-2 text-blue-600" />
              Import JSON Data
            </h3>
            <button
              onClick={fetchApplications}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-700 flex items-center text-xs"
              disabled={isLoading}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
          <div className="p-3">
            <div className="mb-3">
              <label 
                htmlFor="file-upload" 
                className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-3 w-full cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="sr-only"
                  disabled={isUploading}
                />
                <div className="text-center">
                  <FileJson className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                  <p className="text-xs font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-0.5">JSON files only</p>
                </div>
              </label>
            </div>

            {jsonFile && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs">
                <p className="text-blue-700 flex items-center">
                  <FileJson className="mr-1.5 h-3.5 w-3.5" />
                  <span className="font-medium">{jsonFile.name}</span>
                </p>
                {fileContent && (
                  <p className="text-blue-600/80 mt-1 text-xs">
                    File contains {Array.isArray(fileContent) ? fileContent.length : "unknown number of"} applications
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!jsonFile || isUploading}
              className="w-full h-8 px-3 rounded-md bg-blue-600 text-white text-xs font-medium shadow hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="animate-spin w-3.5 h-3.5 mr-1.5" />
                  Importing...
                </>
              ) : (
                "Import Data"
              )}
            </button>

            {uploadSuccess && (
              <div className="mt-2 p-2 bg-green-50 text-green-700 border border-green-100 rounded-md text-xs flex items-start">
                <Check className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {error && (
              <div className="mt-2 p-2 bg-red-50 text-red-700 border border-red-100 rounded-md text-xs flex items-start">
                <X className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Applications List */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppManager;