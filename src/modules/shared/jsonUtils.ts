/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/shared/jsonUtils.ts

/**
 * Exports data as a JSON file with the given filename
 * @param data Any data to be exported
 * @param filename Name of the file to be downloaded
 */
export const exportToJsonFile = (data: any, filename: string): void => {
  try {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  } catch (error) {
    console.error("Error exporting to JSON:", error);
    alert("Failed to export data. See console for details.");
  }
};

/**
 * Parses a JSON file and returns its content
 * @param file The file object to read from
 * @returns A promise that resolves with the parsed JSON data
 */
export const parseJsonFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error("Error parsing JSON file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsText(file);
  });
};
