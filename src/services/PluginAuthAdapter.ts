/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/PluginAuthAdapter.ts
import { AuthUser } from "./authService";

/**
 * Adapter autoryzacji dla pluginów
 * Zapewnia interfejs do interakcji z systemem autoryzacji
 */
export class PluginAuthAdapter {
  private authAttempts = 0;
  
  constructor(public appContext: any) {
    console.log("PluginAuthAdapter initialized with appContext:", !!appContext);
  }
  
  /**
   * Pobiera dane bieżącego użytkownika z kontekstu aplikacji
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      this.authAttempts++;
      
      // Sprawdź, czy mamy bezpośredni dostęp do kontekstu autoryzacji
      if (this.appContext?.authContext?.currentUser) {
        console.log("Retrieved user from auth context");
        return this.appContext.authContext.currentUser;
      }
      
      // Jeśli jesteśmy w trybie deweloperskim, zwróć fałszywego użytkownika
      if (import.meta.env.DEV) {
        console.log("Dev mode - returning mock user");
        return {
          uid: "dev-user",
          email: "dev@example.com",
          availableTokens: 1000,
          createdAt: new Date(),
          lastLoginAt: new Date()
        };
      }
      
      console.warn("No auth context available");
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }
  
  /**
   * Pobiera token użytkownika z kontekstu autoryzacji
   */
  async getCurrentUserToken(): Promise<string | null> {
    try {
      // Sprawdź, czy mamy dostęp do metody getToken w kontekście autoryzacji
      if (this.appContext?.authContext?.getToken) {
        const token = await this.appContext.authContext.getToken();
        return token;
      }
      
      // W trybie deweloperskim zwróć fałszywy token
      if (import.meta.env.DEV) {
        return "dev-token-123456";
      }
      
      console.warn("No getToken method available in auth context");
      return null;
    } catch (error) {
      console.error("Error getting user token:", error);
      return null;
    }
  }
  
  /**
   * Pobiera liczbę prób autoryzacji
   */
  getAuthAttempts(): number {
    return this.authAttempts;
  }
  
  /**
   * Odświeża dane użytkownika
   */
  async refreshUserData(): Promise<void> {
    try {
      if (this.appContext?.authContext?.refreshUserData) {
        await this.appContext.authContext.refreshUserData();
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }

  /**
   * Zmniejsza liczbę dostępnych tokenów
   */
  decreaseTokens(amount: number): void {
    try {
      if (this.appContext?.authContext?.decreaseTokens) {
        this.appContext.authContext.decreaseTokens(amount);
      }
    } catch (error) {
      console.error("Error decreasing tokens:", error);
    }
  }
  
  /**
   * Pobiera element kontekstowy na podstawie tytułu
   * Ta metoda została dodana, aby ułatwić dostęp do systemu kontekstowego
   */
  getContextItemByTitle(title: string): any {
    try {
      if (this.appContext?.getContextItems) {
        const contextItems = this.appContext.getContextItems();
        return contextItems.find((item: any) => item.title === title);
      }
      return null;
    } catch (error) {
      console.error("Error getting context item:", error);
      return null;
    }
  }
}