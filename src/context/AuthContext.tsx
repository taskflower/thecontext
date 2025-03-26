// src/context/AuthContext.tsx with payment page check
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { AuthUser, authService } from '@/services/authService';
import { paymentService } from '@/services/PaymentService';
import { PaymentDialog } from '@/components/studio/PaymentDialog';


// Configuration
const MIN_TOKEN_THRESHOLD = 500; // Show payment dialog when tokens fall below this

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  
  // Token management
  availableTokens: number;
  decreaseTokens: (amount: number) => void;
  refreshUserData: () => Promise<void>;
  
  // Payment handling
  showPaymentDialog: boolean;
  setShowPaymentDialog: (show: boolean) => void;
  suppressPaymentDialog: boolean;
  setSuppressPaymentDialog: (suppress: boolean) => void;
  processPayment: (tokenCount: number) => Promise<{success: boolean, checkoutUrl?: string} | false>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  getToken: async () => null,
  
  availableTokens: 0,
  decreaseTokens: () => {},
  refreshUserData: async () => {},
  
  showPaymentDialog: false,
  setShowPaymentDialog: () => {},
  suppressPaymentDialog: false,
  setSuppressPaymentDialog: () => {},
  processPayment: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTokenUsage, setPendingTokenUsage] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [suppressPaymentDialog, setSuppressPaymentDialog] = useState(false);

  // Calculate available tokens considering pending usage
  const availableTokens = currentUser ? Math.max(0, currentUser.availableTokens - pendingTokenUsage) : 0;

  // Check if tokens are below threshold and show payment dialog if needed
  useEffect(() => {
    if (currentUser && availableTokens < MIN_TOKEN_THRESHOLD && !suppressPaymentDialog) {
      setShowPaymentDialog(true);
    }
  }, [currentUser, availableTokens, suppressPaymentDialog]);

  // Fetch user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        availableTokens: userData?.availableTokens || 0,
        createdAt: userData?.createdAt?.toDate() || new Date(firebaseUser.metadata.creationTime || Date.now()),
        lastLoginAt: userData?.lastLoginAt?.toDate() || new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
        name: userData?.name || '',
        role: userData?.role || 'user'
      };
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
      // Return basic user data if Firestore fails
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        availableTokens: 0,
        createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
        lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now())
      };
    }
  };

  // Refresh user data from database
  const refreshUserData = async () => {
    if (!auth.currentUser) return;
    
    try {
      setIsLoading(true);
      const userData = await fetchUserData(auth.currentUser);
      setCurrentUser(userData);
      setPendingTokenUsage(0); // Reset pending changes after refresh
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process payment for tokens
  const processPayment = async (tokenCount: number) => {
    if (!currentUser) return false;
    
    try {
      setIsLoading(true);
      const cost = paymentService.calculateCost(tokenCount);
      const result = await paymentService.processPayment(currentUser.uid, tokenCount, cost);
      
      if (result.success && result.checkoutUrl) {
        return {
          success: true,
          checkoutUrl: result.checkoutUrl
        };
      }
      return false;
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      try {
        if (firebaseUser) {
          const userData = await fetchUserData(firebaseUser);
          setCurrentUser(userData);
          setPendingTokenUsage(0); // Reset pending usage when user changes
          
          // Show payment dialog if tokens are below threshold and not on payment page
          if (userData.availableTokens < MIN_TOKEN_THRESHOLD && !suppressPaymentDialog) {
            setShowPaymentDialog(true);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [suppressPaymentDialog]);

  const signIn = async () => {
    try {
      setIsLoading(true);
      const user = await authService.signInWithGoogle();
      setCurrentUser(user);
      
      // Show payment dialog if tokens are below threshold and not on payment page
      if (user.availableTokens < MIN_TOKEN_THRESHOLD && !suppressPaymentDialog) {
        setShowPaymentDialog(true);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setCurrentUser(null);
      setShowPaymentDialog(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get authentication token
  const getToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    
    try {
      return await auth.currentUser.getIdToken(true);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Optimistically decrease tokens
  const decreaseTokens = (amount: number) => {
    setPendingTokenUsage(current => current + amount);
    
    // Show payment dialog if tokens will fall below threshold after decrease
    if (availableTokens - amount < MIN_TOKEN_THRESHOLD && !suppressPaymentDialog) {
      setShowPaymentDialog(true);
    }
  };

  const contextValue = {
    currentUser,
    isLoading,
    signIn,
    signOut,
    getToken,
    availableTokens,
    decreaseTokens,
    refreshUserData,
    showPaymentDialog,
    setShowPaymentDialog,
    suppressPaymentDialog,
    setSuppressPaymentDialog,
    processPayment
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {showPaymentDialog && <PaymentDialog />}
    </AuthContext.Provider>
  );
};