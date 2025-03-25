// src/components/studio/AuthButton.tsx
import React, { useState } from "react";
import { LogIn, LogOut, User, Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";
import { useAuth } from "@/context/AuthContext";

export const AuthButton: React.FC = () => {
  const { currentUser, isLoading, signIn, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
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

  if (!currentUser) {
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
        <User className="h-4 w-4" />
        <span className="text-xs max-w-[100px] truncate">{currentUser.email}</span>
      </button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-background border border-border rounded-md shadow-md z-50">
          <div className="p-2 text-xs border-b border-border">
            <div className="font-medium">{currentUser.email}</div>
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