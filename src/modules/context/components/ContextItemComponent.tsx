// src/modules/context/components/ContextItemComponent.tsx
import React from "react";
import { Edit, MoreHorizontal, X, FileText, FileJson, Eraser, Tag, Database, FileCode } from "lucide-react";
import { ContextItem, ContextType } from "../types";
import { cn } from "@/utils/utils";

interface ContextItemProps {
  item: ContextItem;
  onEdit: (item: ContextItem) => void;
  onDelete: (id: string) => void;
  onClearValue: (id: string) => void;
  menuOpen: boolean;
  toggleMenu: () => void;
  onClick?: (item: ContextItem) => void;
}

const ContextItemComponent: React.FC<ContextItemProps> = ({
  item,
  onEdit,
  onDelete,
  onClearValue,
  menuOpen,
  toggleMenu,
  onClick,
}) => {
  // Funkcja zwracająca odpowiednią ikonę na podstawie typu
  const getIconForType = (type: ContextType) => {
    switch (type) {
      case ContextType.JSON:
        return <FileJson className="h-4 w-4 text-blue-500" />;
      case ContextType.MARKDOWN:
        return <FileCode className="h-4 w-4 text-green-500" />;
      case ContextType.INDEXED_DB:
        return <Database className="h-4 w-4 text-purple-500" />;
      case ContextType.TEXT:
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Funkcja formatująca zawartość kontekstu do wyświetlenia
  const getDisplayContent = (item: ContextItem) => {
    if (!item.content) return "(Brak zawartości)";

    switch (item.type) {
      case ContextType.JSON:
        return <span className="font-mono text-xs">{item.content.length > 60 ? item.content.substring(0, 57) + '...' : item.content}</span>;
      case ContextType.INDEXED_DB:
        return <span className="italic">Kolekcja: {item.content}</span>;
      case ContextType.MARKDOWN:
      case ContextType.TEXT:
      default:
        return item.content.length > 60 ? item.content.substring(0, 57) + '...' : item.content;
    }
  };

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
          {getIconForType(item.type)}
        </div>
        <div className="flex items-center min-w-0 flex-1">
          <span className="font-medium text-sm mr-2">{item.title}:</span>
          <span className="text-sm text-muted-foreground truncate">
            {getDisplayContent(item)}
          </span>

          {/* Znaczniki typu i powiązania */}
          <div className="flex items-center ml-2 space-x-1">
            {/* Badge dla typu */}
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded",
              item.type === ContextType.JSON 
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                : item.type === ContextType.MARKDOWN 
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : item.type === ContextType.INDEXED_DB
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300"
            )}>
              {item.type}
            </span>

            {/* Znacznik dla powiązania ze scenariuszem */}
            {item.scenarioId && (
              <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-1.5 py-0.5 rounded flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                Scoped
              </span>
            )}

            {/* Znacznik dla persystencji */}
            {item.persistent && (
              <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                Trwały
              </span>
            )}
          </div>
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
              Edytuj
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearValue(item.id);
              }}
              className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-muted border-t border-border"
            >
              <Eraser className="h-4 w-4 mr-2" />
              Wyczyść wartość
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted flex items-center border-t border-border"
            >
              <X className="h-4 w-4 mr-2" />
              Usuń
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

export default ContextItemComponent;