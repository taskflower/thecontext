import React from "react";
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Filter,
  Plus,
} from "lucide-react";
import { ViewMode } from "@/types";
import { Button, Input } from "@/components/ui";

interface ScenariosHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleNewScenarioModal: () => void;
}

export const ScenariosHeader: React.FC<ScenariosHeaderProps> = ({
  viewMode,
  setViewMode,
  toggleNewScenarioModal,
}) => {
  return (
    <div className="h-16 bg-background border-b px-6 flex justify-between items-center">
      <h2 className="text-base font-semibold">Scenarios</h2>

      <div className="flex items-center">
        <div className="relative mr-4">
          <Input
            type="text"
            placeholder="Search scenarios..."
            className="w-64 pl-9"
          />
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-muted-foreground"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mr-3"
          onClick={toggleNewScenarioModal}
        >
          <Plus size={16} className="mr-2" />
          New Scenario
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="mr-3"
          title="Filter scenarios"
        >
          <Filter size={16} />
        </Button>

        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === "cards" ? "bg-primary/10 text-primary" : ""}
            onClick={() => setViewMode("cards")}
            title="Card view"
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === "list" ? "bg-primary/10 text-primary" : ""}
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <ListIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScenariosHeader;
