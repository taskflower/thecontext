import { Focus, PanelLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/utils/utils";
import { AuthButton } from "../AuthButton";
import { Link } from "react-router-dom";
import { usePanelStore } from "@/modules/PanelStore";


export const Header: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { showLeftPanel, toggleLeftPanel } = usePanelStore();
  
  return (
    <header className="border-b border-border h-14 px-4 flex items-center justify-between bg-background z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-xs font-semibold flex items-center">
          <Focus className="mr-2 h-4 w-4 text-primary" />
          <Link to="/">RevertContext.com <p className="font-normal">Wizard style AI:APPS framework</p></Link>
        </h1>
      </div>
      <div className="flex items-center gap-3 z-30">
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