// src/modules/context/components/ContextItemComponent.tsx
import React from "react";
import { Edit, MoreHorizontal, X, FileText, FileJson, Eraser } from "lucide-react";
import { ContextItem } from "../types";
import { detectContentType } from "../utils";
import { cn } from "@/utils/utils";

interface ContextItemProps {
  item: ContextItem;
  onEdit: (item: ContextItem) => void;
  onDelete: (id: string) => void;
  onClearValue: (id: string) => void; // New prop for clearing value
  menuOpen: boolean;
  toggleMenu: () => void;
  onClick?: (item: ContextItem) => void; // Callback for clicking the entire item
}

const ContextItemComponent: React.FC<ContextItemProps> = ({
  item,
  onEdit,
  onDelete,
  onClearValue, // Added new prop
  menuOpen,
  toggleMenu,
  onClick,
}) => {
  // Detect if content is JSON or text
  const { type } = detectContentType(item.content);

  return (
    <li 
      className="group flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted/50 cursor-pointer"
      onClick={(e) => {
        // Zapobiegamy propagacji kliknięcia, jeśli kliknięto w menu kontekstowe
        if ((e.target as Element).closest('[data-menu-container="true"]')) {
          return;
        }
        if (onClick) {
          onClick(item);
        }
      }}
    >
      <div className="flex items-center min-w-0 flex-1">
        <div className="mr-2">
          {type === "json" ? (
            <FileJson className="h-4 w-4 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </div>
        <div className="flex items-center min-w-0 flex-1">
          <span className="font-medium text-sm mr-2">{item.title}:</span>
          {type === "json" ? (
            <span className="text-sm text-muted-foreground truncate bg-muted rounded-md p-1">
              {item.content || "(No content)"}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground truncate p-1">
              {item.content || "(No content)"}
            </span>
          )}

          {type === "json" && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded">
              JSON
            </span>
          )}
        </div>
      </div>

      <div className="relative flex-shrink-0 ml-2" data-menu-container="true">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground",
            menuOpen
              ? "bg-muted text-foreground"
              : "opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-md z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-muted"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearValue(item.id);
              }}
              className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-muted border-t border-border"
            >
              <Eraser className="h-4 w-4 mr-2" />
              Clear Value
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted flex items-center border-t border-border"
            >
              <X className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

export default ContextItemComponent;