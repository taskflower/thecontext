// src/modules/flow/components/templates/bigballs/Header.tsx
import React from "react";
import { X } from "lucide-react";
import { HeaderProps } from "../../interfaces";
import { useAppStore } from "@/modules/store";
import { Button } from "@/components/ui/button";

const Header: React.FC<HeaderProps> = ({
  currentStepIndex,
  nodeName,
  onClose,
}) => {
  // Get current workspace information
  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);
  const currentWorkspace = getCurrentWorkspace();

  return (<>
    <div className="px-5 py-6 bg-white">
      {/* Logo/brand area */}
      <div className="w-full flex items-center justify-between">
        <div className="font-black text-xl tracking-tighter">
          {currentWorkspace?.title || "WISE.ADS"}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full text-black hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Main heading */}
      <div className="mt-10 mb-8">
        <h2 className="text-3xl font-normal">
          Przeprowadzimy 
          <br />
          Cię przez Twoją
          <br />
          <span className="font-bold">
            {nodeName ? nodeName.toLowerCase() : "pierwszą"}{" "}
            {currentWorkspace?.description || "kampanię"}
          </span>
        </h2>
      </div>

      {/* Current step indicator */}
      <div className="mb-4">
        <h3 className="font-bold text-base">
          Krok {currentStepIndex + 1}: {nodeName || `Etap ${currentStepIndex + 1}`}
        </h3>
      </div>
    </div><div className="flex-1"></div></>
  );
};

export default Header;