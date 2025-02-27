import React from "react";
import { Search, LayoutGrid, List as ListIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabName, ViewMode } from "./types";

interface HeaderProps {
  activeTab: TabName;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, viewMode, setViewMode }) => {
  return (
    <div className="h-16 bg-background border-b px-6 flex justify-between items-center">
      <div className="text-xl font-medium">
        {activeTab === "dashboard" && "Dashboard"}
        {activeTab === "tasks" && "Task Board"}
        {activeTab === "documents" && "Documents"}
      </div>

      <div className="flex items-center">
        <div className="relative mr-4">
          <Input
            type="text"
            placeholder="Search..."
            className="w-64 pl-9"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
        </div>

        {activeTab === "dashboard" && (
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={viewMode === "cards" ? "bg-primary/10 text-primary" : ""}
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={viewMode === "list" ? "bg-primary/10 text-primary" : ""}
              onClick={() => setViewMode("list")}
            >
              <ListIcon size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;