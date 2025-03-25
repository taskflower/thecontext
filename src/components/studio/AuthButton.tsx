// src/components/studio/AuthButton.tsx
import React, { useState, useEffect } from "react";
import { LogIn, LogOut, User, Loader2 } from "lucide-react";
import { auth } from "@/firebase/config";
import { authService } from "@/services/authService";
import { onAuthStateChanged } from "firebase/auth";
import { cn } from "@/utils/utils";

export const AuthButton: React.FC = () => {
  const [user, setUser] = useState<{ email: string; photoURL?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email || "User",
          photoURL: firebaseUser.photoURL || undefined
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await authService.signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <button className="p-2 rounded-md bg-muted/20 text-foreground flex items-center gap-2" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-xs">Loading...</span>
      </button>
    );
  }

  if (!user) {
    return (
      <button
        className="p-2 rounded-md hover:bg-muted/50 text-foreground flex items-center gap-2"
        onClick={handleLogin}
      >
        <LogIn className="h-4 w-4" />
        <span className="text-xs">Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        className={cn(
          "p-2 rounded-md hover:bg-muted/50 text-foreground flex items-center gap-2",
          isDropdownOpen && "bg-muted/50"
        )}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt="Profile" 
            className="h-5 w-5 rounded-full"
          />
        ) : (
          <User className="h-4 w-4" />
        )}
        <span className="text-xs max-w-[100px] truncate">{user.email}</span>
      </button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-background border border-border rounded-md shadow-md z-50">
          <div className="p-2 text-xs border-b border-border">
            <div className="font-medium">{user.email}</div>
          </div>
          <button
            className="w-full text-left p-2 text-xs flex items-center gap-2 hover:bg-muted/50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};