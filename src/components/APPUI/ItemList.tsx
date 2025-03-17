import { cn } from "@/utils/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Trash2 } from "lucide-react";
import { memo } from "react";
import { Button } from "../ui/button";
import { EmptyState } from "./EmptyState";

interface ItemListProps<T extends { id: string }> {
  items: T[];
  selected: string;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  renderItem: (item: T) => React.ReactNode;
  height?: string;
}

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
      <ScrollArea className={`${height}`}>
        <div>
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between",
                "group hover:bg-accent/50 hover:text-accent-foreground cursor-pointer",
                item.id === selected && "bg-accent text-accent-foreground"
              )}
            >
              <div
                className="flex-1 p-2"
                onMouseDown={() => onClick(item.id)}
              >
                {renderItem(item)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {items.length === 0 && <EmptyState />}
        </div>
      </ScrollArea>
    );
  }
) as <T extends { id: string }>(props: ItemListProps<T>) => JSX.Element;