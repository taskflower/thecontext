// src/services/authService.ts
import { auth, googleProvider } from '@/firebase/config';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { tokenService } from './tokenService';

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
      await firebaseSignOut(auth); // Zostawiamy to - to jest wylogowanie z Firebase
      tokenService.clearCache(); // Dodajemy czyszczenie tokena
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
    const user = auth.currentUser;
    if (!user) return null;
    
    // Możemy od razu stworzyć obiekt AuthUser z danych z Firebase
    return {
      uid: user.uid,
      email: user.email || '',
      // Jeśli potrzebujemy dodatkowych danych specyficznych dla aplikacji,
      // możemy je pobrać z Firestore
      availableTokens: 0, // domyślna wartość lub z cache
      createdAt: new Date(user.metadata.creationTime || Date.now()),
      lastLoginAt: new Date(user.metadata.lastSignInTime || Date.now())
    };
  }
}

export const authService = new AuthService();