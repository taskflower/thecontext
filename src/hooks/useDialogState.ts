// src/hooks/useDialogState.ts
import { useState, ChangeEvent } from 'react';
import { FormData } from '@/types/app';

export const useDialogState = (initialState: FormData) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialState);

  const openDialog = (data: FormData = initialState) => {
    setFormData(data);
    setIsOpen(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return {
    isOpen,
    formData,
    openDialog,
    handleChange,
    setIsOpen,
    setFormData
  };
};