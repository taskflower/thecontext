// src/plugins/data-processor/utils.ts
export const processData = (inputData: string, transformationType: string): string => {
    switch (transformationType) {
      case 'uppercase':
        return inputData.toUpperCase();
      case 'lowercase':
        return inputData.toLowerCase();
      case 'reverse':
        return inputData.split('').reverse().join('');
      case 'count':
        return `Character count: ${inputData.length}`;
      default:
        return inputData;
    }
  };