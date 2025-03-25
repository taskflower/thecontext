// src/services/authService.ts - Modified version
import { auth, googleProvider } from '@/firebase/config';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface AuthUser {
  uid: string;
  email: string;
  availableTokens: number;
  createdAt: Date;
  lastLoginAt: Date;
  name?: string;
  role?: string;
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

      // Get additional user data from Firestore to include tokens
      const userData = await this.getFirestoreUserData(result.user.uid);
      
      const data = await response.json();
      return {
        ...data.user,
        availableTokens: userData?.availableTokens || 0,
        name: userData?.name || '',
        role: userData?.role || 'user'
      };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  // Wylogowanie
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth); // Wylogowanie z Firebase
      // Usunięte odwołanie do tokenService.clearCache()
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
    return user.getIdToken(true); // Wymuszamy odświeżenie tokena
  }

  // Get additional user data from Firestore
  private async getFirestoreUserData(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching Firestore user data:', error);
      return null;
    }
  }

  // Sprawdzenie statusu autoryzacji
  async checkAuthStatus(): Promise<AuthUser | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    // Get additional user data from Firestore
    const firestoreData = await this.getFirestoreUserData(user.uid);
    
    // Stwórz obiekt AuthUser z danych z Firebase i Firestore
    return {
      uid: user.uid,
      email: user.email || '',
      availableTokens: firestoreData?.availableTokens || 0,
      createdAt: firestoreData?.createdAt?.toDate() || new Date(user.metadata.creationTime || Date.now()),
      lastLoginAt: firestoreData?.lastLoginAt?.toDate() || new Date(user.metadata.lastSignInTime || Date.now()),
      name: firestoreData?.name || '',
      role: firestoreData?.role || 'user'
    };
  }
}

export const authService = new AuthService();