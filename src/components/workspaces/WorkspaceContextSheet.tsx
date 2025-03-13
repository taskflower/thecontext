// src/components/workspaces/WorkspaceContextSheet.tsx
import React from 'react';
import { Database } from 'lucide-react';
import { WorkspaceContextPanel } from './WorkspaceContextPanel';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,

} from '@/components/ui/sheet';

type WorkspaceContextSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export const WorkspaceContextSheet: React.FC<WorkspaceContextSheetProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full min-w-[40rem]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Container Context
          </SheetTitle>
          <SheetDescription>
            Data shared across all scenarios in this workspace
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
          <WorkspaceContextPanel />
        </div>
      </SheetContent>
    </Sheet>
  );
};