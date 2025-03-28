// src/modules/flow/components/templates/alternative/Header.tsx
import React from "react";
import { HeaderProps } from "../../interfaces";
import { useAppStore } from "@/modules/store";

const Header: React.FC<HeaderProps> = () => {
  // Pobierz informacje o bieżącym workspace
  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);
  const currentWorkspace = getCurrentWorkspace();

  return (
    <h1 className="p-8 mt-12 text-6xl font-bold">
      {currentWorkspace && (
        <>
          {currentWorkspace.title}
          <p className="mt-16 text-4xl">
            {currentWorkspace.description}
          </p>
        </>
      )}
    </h1>
  );
};

export default Header;