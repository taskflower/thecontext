
import { FileJson, Upload } from "lucide-react";

const FileUpload = ({ 
  onFileChange, 
  jsonFile, 
  fileContent, 
  onImport, 
  isSeedingData, 
  isDisabled 
}:any) => {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileJson className="mr-2 h-5 w-5 text-primary" />
        Import JSON Data
      </h2>
      
      <p className="mb-4 text-muted-foreground">
        Select a JSON file containing your application structure.
      </p>

      <div className="mb-4">
        <label 
          htmlFor="file-upload" 
          className="flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 w-full cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">JSON files only</p>
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={onFileChange}
            className="sr-only"
          />
        </label>
      </div>

      {jsonFile && (
        <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg">
          <p className="text-success flex items-center">
            <FileJson className="mr-2 h-4 w-4" />
            <span className="font-medium">{jsonFile.name}</span>
          </p>
          {fileContent && (
            <p className="text-sm text-success/90 mt-1">
              File contains {Array.isArray(fileContent) ? fileContent.length : "unknown number of"} applications
            </p>
          )}
        </div>
      )}

      <button
        onClick={onImport}
        disabled={isSeedingData || isDisabled}
        className="w-full inline-flex items-center justify-center h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 transition disabled:opacity-50"
      >
        {isSeedingData ? "Importing..." : "Import Data"}
      </button>
    </div>
  );
};

export default FileUpload;