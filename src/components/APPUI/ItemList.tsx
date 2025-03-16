// src/components/APPUI/ItemList.tsx
import { ReactNode, memo } from "react";
import { Trash2 } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/utils/utils";
import { Button } from "../ui/button";


interface ItemListProps<T extends { id: string }> {
  items: T[];
  selected: string;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  renderItem: (item: T) => ReactNode;
}

// Fix for memo with generics
export const ItemList = memo(
  function ItemList<T extends { id: string }>({
    items,
    selected,
    onClick,
    onDelete,
    renderItem,
  }: ItemListProps<T>) {
    return (
      <ScrollArea className="h-[180px] rounded-md">
        <div className="space-y-px">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-1 text-xs",
                "group hover:bg-accent/50 rounded-sm cursor-pointer",
                "transition-colors duration-200",
                item.id === selected && "bg-accent/80 text-accent-foreground"
              )}
            >
              <div
                className="flex-1 p-2 overflow-hidden cursor-pointer"
                onClick={() => onClick(item.id)}
              >
                {renderItem(item)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
          {items.length === 0 && <EmptyState />}
        </div>
      </ScrollArea>
    );
  }
) as <T extends { id: string }>(props: ItemListProps<T>) => JSX.Element;