/* eslint-disable @typescript-eslint/no-explicit-any */
// entityFactory.ts
export const entityFactory = {
    async createContainer(projectId: string, data: any): Promise<string | null> {
      console.log(`Creating container in project ${projectId}:`, data);
      // W rzeczywistej implementacji wywołałbyś tutaj odpowiedni store
      return `container-${Date.now()}`;
    },
    
    async createDocument(projectId: string, data: any): Promise<string | null> {
      console.log(`Creating document in project ${projectId}:`, data);
      // W rzeczywistej implementacji wywołałbyś tutaj odpowiedni store
      return `document-${Date.now()}`;
    },
    
    async createTask(projectId: string, data: any): Promise<string | null> {
      console.log(`Creating task in project ${projectId}:`, data);
      // W rzeczywistej implementacji wywołałbyś tutaj odpowiedni store
      return `task-${Date.now()}`;
    },
    
    async createTemplate(projectId: string, data: any): Promise<string | null> {
      console.log(`Creating template in project ${projectId}:`, data);
      // W rzeczywistej implementacji wywołałbyś tutaj odpowiedni store
      return `template-${Date.now()}`;
    },
    
    async updateProject(projectId: string, data: any): Promise<boolean> {
      console.log(`Updating project ${projectId}:`, data);
      // W rzeczywistej implementacji wywołałbyś tutaj odpowiedni store
      return true;
    }
  };
  