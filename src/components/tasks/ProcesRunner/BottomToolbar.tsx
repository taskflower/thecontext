import { FC } from "react";
import { Button } from "@/components/ui/button";
import { PanelRightOpen, PanelRightClose, ChevronUp, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trans } from "@lingui/macro";
import { AppLink } from "@/components/AppLink";

interface BottomToolbarProps {
  viewMode: "card" | "mini";
  setViewMode: (mode: "card" | "mini") => void;
  isPanelOpen: boolean;
  togglePanel: () => void;
}

export const BottomToolbar: FC<BottomToolbarProps> = ({
  viewMode,
  setViewMode,
  isPanelOpen,
  togglePanel,
}) => {
  return (
    <div className="fixed bottom-0 right-0 w-full bg-background z-20">
      <Separator />
      <div className="p-3 flex justify-end items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <span className="mr-2">{viewMode === 'card' ? 'Card View' : 'Mini View'}</span>
              <ChevronUp className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top">
            <DropdownMenuItem onClick={() => setViewMode('card')}>
              Card View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewMode('mini')}>
              Mini View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isPanelOpen ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={togglePanel}
            className="h-8"
          >
            <PanelRightClose className="h-4 w-4" />
            <span className="ml-2">
              <Trans>Hide Preview</Trans>
            </span>
          </Button>
        ) : (
          <div className="flex gap-3">
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={togglePanel}
              className="h-8"
            >
              <PanelRightOpen className="h-4 w-4" />
              <span className="ml-2">
                <Trans>Show Preview</Trans>
              </span>
            </Button>
          </div>
        )}
        <AppLink to="/tasks/templates" admin>
              <Button 
                variant="default" 
                size="sm" 
                className="h-8 bg-black hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </AppLink>
      </div>
    </div>
  );
};

export default BottomToolbar;