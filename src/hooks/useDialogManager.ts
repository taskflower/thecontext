/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useDialogManager.ts

import { DialogField, useDialog } from "@/components/APPUI/DialogProvider";


interface DialogOptions {
  confirmText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const useDialogManager = () => {
  const { openDialog, closeDialog } = useDialog();

  const createDialog = (
    title: string, 
    fields: DialogField[], 
    onConfirm: (formData: Record<string, any>) => void,
    options: DialogOptions = {}
  ) => {
    openDialog({
      title,
      fields,
      onConfirm,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      size: options.size
    });
  };

  return { createDialog, closeDialog };
};