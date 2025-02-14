// src/services/authService.ts
import { auth, googleProvider } from '@/firebase/config';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string;
  availableTokens: number;
  createdAt: Date;
  lastLoginAt: Date;
}

export class AuthService {
  private API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Logowanie przez Google
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Wysyłamy token do backendu
      const response = await fetch(`${this.API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with backend');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  // Wylogowanie
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Pobranie aktualnego tokena
  async getCurrentUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    return user.getIdToken();
  }

  // Sprawdzenie statusu autoryzacji
  async checkAuthStatus(): Promise<AuthUser | null> {
    const token = await this.getCurrentUserToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return null;
    }
  }
}

export const authService = new AuthService();