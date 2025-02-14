// Aktualizacja interfejsu User
export interface UserType {
    id: string;
    name: string;
    email: string;
    role?: string;
    lastLogin?: string;
    availableTokens?: number; // dodane pole
  }

  export interface UserData {
    name: string;
    email: string;
    role: string;
    availableTokens?: number;
  }