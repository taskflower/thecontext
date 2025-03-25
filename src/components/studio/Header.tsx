// components/Header.tsx
import { Focus, PanelLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/utils/utils";
import { AuthButton } from "./AuthButton";

interface HeaderProps {
  showLeftPanel: boolean;
  toggleLeftPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({ showLeftPanel, toggleLeftPanel }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <header className="border-b border-border h-14 px-4 flex items-center justify-between bg-background z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-xs font-semibold flex items-center">
          <Focus className="mr-2 h-4 w-4 text-primary" />
          <span>Deep Context Studio</span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Google Authentication Button */}
        <AuthButton />

        <button
          className="p-2 rounded-md hover:bg-muted text-foreground"
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          className={cn(
            "p-2 rounded-md text-foreground",
            showLeftPanel ? "bg-muted" : "hover:bg-muted/50"
          )}
          onClick={toggleLeftPanel}
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};