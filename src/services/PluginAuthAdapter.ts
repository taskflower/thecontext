/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/PluginAuthAdapter.ts
import { AuthUser } from './authService';

export interface AuthAttempt {
  method: string;
  success: boolean;
  error?: string;
}

/**
 * Simplified adapter for auth functionality for plugins
 */
export class PluginAuthAdapter {
  private attempts: AuthAttempt[] = [];
  private authContext: any;

  constructor(private appContext?: any) {
    this.authContext = appContext?.authContext;
  }

  /**
   * Gets the current user from the auth context or app context
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // First try from authContext if available
      if (this.authContext?.currentUser) {
        this.attempts.push({ method: 'authContext.currentUser', success: true });
        return this.authContext.currentUser;
      }
      
      // Then try from appContext
      if (this.appContext?.user) {
        const user = this.appContext.user;
        this.attempts.push({ method: 'appContext.user', success: true });
        
        return {
          uid: user.uid || user.id,
          email: user.email || '',
          availableTokens: user.availableTokens || user.tokens || 0,
          createdAt: user.createdAt || new Date(),
          lastLoginAt: user.lastLoginAt || new Date()
        };
      }
      
      this.attempts.push({ 
        method: 'getCurrentUser', 
        success: false, 
        error: 'No user found in contexts' 
      });
      
      return null;
    } catch (error) {
      this.attempts.push({ 
        method: 'getCurrentUser', 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }

  /**
   * Gets the current user token from the auth context or app context
   */
  async getCurrentUserToken(): Promise<string | null> {
    this.attempts = [];
    
    try {
      // First try from authContext
      if (this.authContext?.getToken) {
        try {
          const token = await this.authContext.getToken();
          if (token) {
            this.attempts.push({ method: 'authContext.getToken', success: true });
            return token;
          }
        } catch (error) {
          this.attempts.push({ 
            method: 'authContext.getToken', 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
      
      // Then try from appContext.auth
      if (this.appContext?.authService?.getCurrentUserToken) {
        try {
          const token = await this.appContext.authService.getCurrentUserToken();
          if (token) {
            this.attempts.push({ method: 'appContext.authService', success: true });
            return token;
          }
        } catch (error) {
          this.attempts.push({ 
            method: 'appContext.authService', 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
      
      // Try from appContext.user
      if (this.appContext?.user?.getIdToken) {
        try {
          const token = await this.appContext.user.getIdToken();
          if (token) {
            this.attempts.push({ method: 'appContext.user.getIdToken', success: true });
            return token;
          }
        } catch (error) {
          this.attempts.push({ 
            method: 'appContext.user.getIdToken', 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
      
      this.attempts.push({ 
        method: 'getCurrentUserToken', 
        success: false, 
        error: 'No valid token source found' 
      });
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

  /**
   * Get authentication attempts history
   */
  getAuthAttempts(): AuthAttempt[] {
    return this.attempts;
  }

  /**
   * Check if the adapter is loading (always returns false in simplified version)
   */
  isLoading(): boolean {
    return false;
  }
}