// src/components/APPUI/Dialog.tsx
import { DialogField } from "@/modules/types";
import React, { ChangeEvent } from "react";
import { Button } from "../ui/button";
import { 
  Dialog as UIDialog, 
  DialogHeader, 
  DialogFooter, 
  DialogContent,
  DialogTitle
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";

// Define FormData interface if it's missing
interface FormData {
  [key: string]: string | number;
}

interface CustomDialogProps {
  title: string;
  onClose: () => void;
  onAdd: () => void;
  fields: DialogField[];
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isOpen?: boolean;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({
  title,
  onClose,
  onAdd,
  fields,
  formData,
  onChange,
  isOpen = true,
}) => {
  const handleSelectChange = (name: string, value: string) => {
    const changeEvent = {
      target: { name, value },
    } as ChangeEvent<HTMLSelectElement>;
    onChange(changeEvent);
  };

  return (
    <UIDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {fields.map((field) =>
            field.type === "select" ? (
              <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field.name} className="text-right">
                  {field.placeholder}
                </Label>
                <Select
                  value={String(formData[field.name] || "")}
                  onValueChange={(value) => handleSelectChange(field.name, value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={`Select ${field.placeholder}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field.name} className="text-right">
                  {field.placeholder}
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  value={String(formData[field.name] || "")}
                  onChange={onChange}
                  className="col-span-3"
                />
              </div>
            )
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onAdd}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </UIDialog>
  );
};

// Export with the original name for backwards compatibility
export { CustomDialog as Dialog };