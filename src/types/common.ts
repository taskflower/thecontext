// src/types/common.ts
export type BaseEntity = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  }
  export enum MessageRole {
    User = 'user',
    Assistant = 'assistant',
    System = 'system'
  }