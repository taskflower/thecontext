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
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-1 text-sm",
                "group hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer",
                "transition-colors duration-150",
                item.id === selected && "bg-accent text-accent-foreground"
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
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
          {items.length === 0 && <EmptyState />}
        </div>
      </ScrollArea>
    );
  }
) as <T extends { id: string }>(props: ItemListProps<T>) => JSX.Element;