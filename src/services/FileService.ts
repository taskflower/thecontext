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
        console.log(`Reading file: ${file.name}, size: ${(file.size / 1024).toFixed(2)} KB`);
        const fileContent = await file.text();
        console.log(`File content length: ${fileContent.length} characters`);
        
        const importData = JSON.parse(fileContent);
        
        // Check for specific content
        if (importData && typeof importData === 'object') {
          const hasContextItems = !!importData["flowchart-app-state"]?.state?.contextItems;
          const contextCount = importData["flowchart-app-state"]?.state?.contextItems?.length || 0;
          
          // Extract scenarios
          const workspaces = importData["flowchart-app-state"]?.state?.items || [];
          const scenarios = workspaces.flatMap((w: any) => w.children || []);
          
          // Check for filters
          let filtersCount = 0;
          let scenariosWithFilters = 0;
          
          for (const scenario of scenarios) {
            if (scenario.filters && scenario.filters.length > 0) {
              scenariosWithFilters++;
              filtersCount += scenario.filters.length;
            }
          }
          
          console.log(`File analysis: ${file.name}`, {
            hasContextItems,
            contextCount,
            scenariosCount: scenarios.length,
            scenariosWithFilters,
            filtersCount
          });
        }
        
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