// src/_modules/admin/components/DataImporter.tsx
import React, { useState } from "react";
import { useAuth } from "@/hooks";
import { importService } from "@/_firebase/services";
import { FileJson, RefreshCw, Check, X } from "lucide-react";

interface DataImporterProps {
  onImportSuccess: () => Promise<void>;
  isLoading: boolean;
}

const DataImporter: React.FC<DataImporterProps> = ({ onImportSuccess, isLoading }) => {
  const [error, setError] = useState<string | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const { user } = useAuth();

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
      await onImportSuccess();
    } catch (err) {
      console.error("Error importing data:", err);
      setError(
        `Import error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h3 className="text-sm font-medium flex items-center text-gray-800">
          <FileJson className="w-4 h-4 mr-2 text-blue-600" />
          Import JSON Data
        </h3>
        <button
          onClick={onImportSuccess}
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
  );
};

export default DataImporter;