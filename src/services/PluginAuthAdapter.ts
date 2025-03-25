/* eslint-disable @typescript-eslint/no-explicit-any */
import { authService, AuthUser } from './authService';
import { auth } from '@/firebase/config';

export interface AuthAttempt {
  method: string;
  success: boolean;
  error?: string;
}

/**
 * Adapter dla istniejącego authService, który dostarcza funkcjonalności
 * wymagane przez plugin API Service
 */
export class PluginAuthAdapter {
  private attempts: AuthAttempt[] = [];
  private currentUser: AuthUser | null = null;
  private loading = true;

  constructor(private appContext?: any) {
    this.initialize();
  }

  private async initialize() {
    this.loading = true;
    try {
      await this.fetchCurrentUser();
    } catch (error) {
      console.error("Error initializing PluginAuthAdapter:", error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Próbuje pobrać aktualnego użytkownika z różnych źródeł
   */
  private async fetchCurrentUser() {
    try {
      // Najpierw próbujemy użyć istniejącego authService
      this.currentUser = await authService.checkAuthStatus();
      if (this.currentUser) {
        this.attempts.push({ method: 'authService.checkAuthStatus', success: true });
        return;
      }
      
      // Alternatywnie próbujemy z appContext, jeśli dostępny
      if (this.appContext?.user) {
        this.currentUser = {
          uid: this.appContext.user.uid || this.appContext.user.id,
          email: this.appContext.user.email || '',
          availableTokens: this.appContext.user.availableTokens || this.appContext.user.tokens || 0,
          createdAt: this.appContext.user.createdAt || new Date(),
          lastLoginAt: this.appContext.user.lastLoginAt || new Date()
        };
        this.attempts.push({ method: 'appContext.user', success: true });
        return;
      }
      
      this.attempts.push({ 
        method: 'fetchCurrentUser', 
        success: false, 
        error: 'No authentication source available' 
      });
    } catch (error) {
      this.attempts.push({ 
        method: 'fetchCurrentUser', 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * Sprawdza, czy adapter jest w trakcie ładowania
   */
  isLoading(): boolean {
    return this.loading;
  }

  /**
   * Zwraca listę prób autentykacji
   */
  getAuthAttempts(): AuthAttempt[] {
    return this.attempts;
  }

  /**
   * Pobiera aktualnego zalogowanego użytkownika
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    await this.fetchCurrentUser();
    return this.currentUser;
  }

  /**
   * Pobiera token użytkownika, korzystając z istniejącego authService
   * lub bezpośrednio z Firebase, jeśli to możliwe
   */
  async getCurrentUserToken(): Promise<string | null> {
    this.attempts = [];
    
    try {
      // Najpierw próbujemy użyć istniejącego authService
      const token = await authService.getCurrentUserToken();
      
      if (token) {
        this.attempts.push({ method: 'authService.getCurrentUserToken', success: true });
        return token;
      } else {
        this.attempts.push({ 
          method: 'authService.getCurrentUserToken', 
          success: false, 
          error: 'Token was null' 
        });
      }

      // Próbujemy użyć bezpośrednio Firebase Auth
      if (auth.currentUser) {
        try {
          const firebaseToken = await auth.currentUser.getIdToken();
          if (firebaseToken) {
            this.attempts.push({ method: 'Firebase Auth', success: true });
            return firebaseToken;
          } else {
            this.attempts.push({ 
              method: 'Firebase Auth', 
              success: false, 
              error: 'Token was null' 
            });
          }
        } catch (error) {
          this.attempts.push({ 
            method: 'Firebase Auth', 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }

      // Próbujemy z appContext, jeśli dostępny
      if (this.appContext?.authService?.getCurrentUserToken) {
        try {
          const contextToken = await this.appContext.authService.getCurrentUserToken();
          if (contextToken) {
            this.attempts.push({ method: 'appContext.authService', success: true });
            return contextToken;
          } else {
            this.attempts.push({ 
              method: 'appContext.authService', 
              success: false, 
              error: 'Token was null' 
            });
          }
        } catch (error) {
          this.attempts.push({ 
            method: 'appContext.authService', 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
      
      // Próbujemy z appContext.user.getIdToken, jeśli dostępny
      if (this.appContext?.user?.getIdToken) {
        try {
          const userToken = await this.appContext.user.getIdToken();
          if (userToken) {
            this.attempts.push({ method: 'appContext.user.getIdToken', success: true });
            return userToken;
          } else {
            this.attempts.push({ 
              method: 'appContext.user.getIdToken', 
              success: false, 
              error: 'Token was null' 
            });
          }
        } catch (error) {
          this.attempts.push({ 
            method: 'appContext.user.getIdToken', 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
      
      console.error("All authentication methods failed:", this.attempts);
      return null;
    } catch (error) {
      console.error("Error getting auth token:", error);
      this.attempts.push({ 
        method: 'getCurrentUserToken', 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }
}