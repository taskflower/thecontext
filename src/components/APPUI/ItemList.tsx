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
  height?: string;
}

// Fix for memo with generics
export const ItemList = memo(
  function ItemList<T extends { id: string }>({
    items,
    selected,
    onClick,
    onDelete,
    renderItem,
    height = "h-[220px]"
  }: ItemListProps<T>) {
    return (
      <ScrollArea className={`${height} rounded-md`}>
        <div className="space-y-0.5">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center text-sm",
                "group hover:bg-accent/50 hover:text-accent-foreground cursor-pointer",
                "transition-colors duration-150 border-l-2 border-transparent",
                item.id === selected && "bg-accent text-accent-foreground border-l-2 border-primary"
              )}
            >
              <div
                className="flex-1 p-2 overflow-hidden cursor-pointer"
                onMouseDown={() => onClick(item.id)}
                // Używamy onMouseDown zamiast onClick
              >
                {renderItem(item)}
              </div>
              <div className="pr-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-70 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <EmptyState />}
        </div>
      </ScrollArea>
    );
  }
) as <T extends { id: string }>(props: ItemListProps<T>) => JSX.Element;