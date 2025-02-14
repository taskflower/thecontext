import { User } from "firebase/auth";

// src/services/tokenService.ts
class TokenService {
    private cachedToken: string | null = null;
    private tokenExpirationTime: number | null = null;
    private refreshTimeout: NodeJS.Timeout | null = null;
  
    async getToken(user: User): Promise<string> {
      // Jeśli token istnieje i nie wygasł, zwróć go
      if (this.isTokenValid()) {
        return this.cachedToken!;
      }
  
      // W przeciwnym razie pobierz nowy token
      return this.refreshToken(user);
    }
  
    private async refreshToken(user: User): Promise<string> {
      try {
        const token = await user.getIdToken();
        
        // Cache token
        this.cachedToken = token;
        
        // Oblicz czas wygaśnięcia (Firebase tokeny domyślnie wygasają po 1h)
        // Ustawiamy refreshowanie na 5 minut przed wygaśnięciem
        this.tokenExpirationTime = Date.now() + (55 * 60 * 1000); // 55 minut
        
        // Ustaw timer do odświeżenia tokena
        this.setupRefreshTimer(user);
        
        return token;
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    }
  
    private isTokenValid(): boolean {
      return !!(
        this.cachedToken && 
        this.tokenExpirationTime && 
        Date.now() < this.tokenExpirationTime
      );
    }
  
    private setupRefreshTimer(user: User) {
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
      }
  
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken(user);
      }, 55 * 60 * 1000); // Odśwież po 55 minutach
    }
  
    clearCache() {
      this.cachedToken = null;
      this.tokenExpirationTime = null;
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = null;
      }
    }
  }
  
  export const tokenService = new TokenService();