/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useDialogManager.ts
import { useCallback } from 'react';

import { DialogField } from '@/modules/types';
import { DialogConfig, useDialog } from '@/components/APPUI/DialogProvider';

/**
 * Custom hook for managing common dialog operations
 */
export function useDialogManager() {
  const { openDialog, closeDialog } = useDialog();

  const createDialog = useCallback((
    title: string,
    fields: DialogField[],
    onConfirm: (data: Record<string, any>) => void,
    options: {
      id?: string;
      confirmText?: string;
      cancelText?: string;
      size?: 'sm' | 'md' | 'lg' | 'xl';
      initialData?: Record<string, any>;
    } = {}
  ) => {
    const config: DialogConfig = {
      id: options.id || `dialog-${Date.now()}`,
      title,
      fields,
      onConfirm,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      size: options.size,
    };

    openDialog(config, options.initialData);
  }, [openDialog]);

  return {
    createDialog,
    closeDialog
  };
}