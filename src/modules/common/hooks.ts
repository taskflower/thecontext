/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, ChangeEvent } from "react";

export interface DialogState<T extends Record<string, any>> {
  isOpen: boolean;
  formData: T;
  openDialog: (initialData?: Partial<T>) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useDialogState<T extends Record<string, any>>(
  initialFields: T
): DialogState<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<T>(initialFields);

  const openDialog = (initialData: Partial<T> = {}) => {
    setFormData({ ...initialFields, ...initialData } as T);
    setIsOpen(true);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return { isOpen, formData, openDialog, handleChange, setIsOpen };
}