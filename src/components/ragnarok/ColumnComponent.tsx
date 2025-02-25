import { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ColumnProps {
  title: string;
  children: ReactNode;
  rightActions?: ReactNode;
  emptyState?: ReactNode;
}

export function Column({ title, children, rightActions, emptyState }: ColumnProps) {
  return (
    <div className="h-full relative">
      {/* Right side vertical line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-border"></div>
      
      <div className="flex flex-row items-center justify-between px-6 py-4 border-b">
        <h2 className="text-base font-semibold">{title}</h2>
        {rightActions}
      </div>
      
      <div className="px-2">
        <ScrollArea className="h-[calc(100vh-240px)]">
          <div className="space-y-1 pt-3">
            {children || emptyState}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}