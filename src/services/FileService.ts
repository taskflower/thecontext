/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/FileService.ts
export const FileService = {
    // Export data to a file
    exportDataToFile: (data: Record<string, any>): void => {
      try {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = `flow-builder-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (error) {
        console.error("Export failed:", error);
        throw error;
      }
    },
    
    // Read data from a file
    readDataFromFile: async (file: File): Promise<Record<string, any>> => {
      try {
        const fileContent = await file.text();
        const importData = JSON.parse(fileContent);
        
        if (!importData || typeof importData !== 'object') {
          throw new Error("Invalid import file format");
        }
        
        return importData;
      } catch (error) {
        console.error("Import failed:", error);
        throw error;
      }
    }
  };