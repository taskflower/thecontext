// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from '@firebase/auth';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { auth, googleProvider, db } from '@/firebase/config';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if user document exists, if not create it
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // Create user document with initial data
          await setDoc(userDocRef, {
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            createdAt: new Date(),
          });
        }

        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google Sign-In Error', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    logout
  };
}