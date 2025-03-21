// src/modules/ui/components/index.tsx
import React from "react";
import { X, PlusCircle } from "lucide-react";
import { 
  SectionHeaderProps, 
  DialogProps, 
  ItemListProps 
} from "../types";

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onAddClick,
}) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
    <div className="font-medium text-foreground">{title}</div>
    <button
      className="p-1 rounded-md hover:bg-accent text-muted-foreground"
      onClick={onAddClick}
    >
      <PlusCircle className="h-4 w-4" />
    </button>
  </div>
);

export const EmptyState: React.FC = () => (
  <div className="py-4 text-center text-xs text-muted-foreground">
    No items
  </div>
);

export const Dialog: React.FC<DialogProps> = ({
  title,
  onClose,
  onAdd,
  fields,
  formData,
  onChange,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-card rounded-lg shadow-lg w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-medium text-card-foreground">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-accent/80"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
      <div className="p-4">
        <div className="grid gap-3 py-3">
          {fields.map((field) =>
            field.type === "select" ? (
              <select
                key={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={onChange}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              >
                <option value="">-- Select {field.placeholder} --</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={onChange}
                placeholder={field.placeholder}
                type={field.type || "text"}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              />
            )
          )}
          <button
            onClick={onAdd}
            className="py-1.5 px-3 text-sm rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Generic Item List Component
export function ItemList<T extends { id: string }>({
  items,
  selected,
  onClick,
  onDelete,
  renderItem,
}: ItemListProps<T>) {
  return (
    <div className="overflow-auto">
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center px-4 py-1.5 w-full cursor-pointer ${
              item.id === selected
                ? "bg-accent/50 border-l-2 border-l-primary"
                : "hover:bg-accent/30"
            }`}
            onClick={() => onClick(item.id)}
          >
            <div className="flex-1 truncate text-foreground">
              {renderItem(item)}
            </div>
            <button
              className="p-1 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {items.length === 0 && <EmptyState />}
      </div>
    </div>
  );
}