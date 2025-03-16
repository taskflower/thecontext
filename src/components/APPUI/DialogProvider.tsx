/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/dialog/DialogProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog as UIDialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogField } from "@/modules/types";

// Define dialog configurations
export interface DialogConfig {
  id: string;
  title: string;
  fields: DialogField[];
  onConfirm: (formData: Record<string, any>) => void;
  confirmText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface DialogState {
  config: DialogConfig | null;
  isOpen: boolean;
  formData: Record<string, any>;
}

interface DialogContextType {
  openDialog: (config: DialogConfig, initialData?: Record<string, any>) => void;
  closeDialog: () => void;
  updateFormData: (key: string, value: any) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<DialogState>({
    config: null,
    isOpen: false,
    formData: {},
  });

  const openDialog = (config: DialogConfig, initialData: Record<string, any> = {}) => {
    // Initialize form data with defaults from fields
    const formData = { ...initialData };
    config.fields.forEach(field => {
      if (!(field.name in formData)) {
        formData[field.name] = '';
      }
    });

    setDialogState({
      config,
      isOpen: true,
      formData,
    });
  };

  const closeDialog = () => {
    setDialogState(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  const updateFormData = (key: string, value: any) => {
    setDialogState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [key]: value,
      },
    }));
  };

  const handleConfirm = () => {
    if (dialogState.config?.onConfirm) {
      dialogState.config.onConfirm(dialogState.formData);
    }
    closeDialog();
  };

  const handleSelectChange = (name: string, value: string) => {
    updateFormData(name, value);
  };

  const getSizeClass = () => {
    switch (dialogState.config?.size) {
      case 'sm': return 'sm:max-w-sm';
      case 'md': return 'sm:max-w-md';
      case 'lg': return 'sm:max-w-lg';
      case 'xl': return 'sm:max-w-xl';
      default: return 'sm:max-w-md';
    }
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog, updateFormData }}>
      {children}

      {dialogState.config && (
        <UIDialog 
          open={dialogState.isOpen} 
          onOpenChange={(open) => !open && closeDialog()}
        >
          <DialogContent className={getSizeClass()}>
            <DialogHeader>
              <DialogTitle>{dialogState.config.title}</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {dialogState.config.fields.map((field) => {
                if (field.type === 'select') {
                  return (
                    <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={field.name} className="text-right">
                        {field.placeholder}
                      </Label>
                      <Select
                        value={dialogState.formData[field.name]?.toString() || ''}
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
                  );
                } else if (field.type === 'textarea') {
                  return (
                    <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={field.name} className="text-right">
                        {field.placeholder}
                      </Label>
                      <Textarea
                        id={field.name}
                        value={dialogState.formData[field.name]?.toString() || ''}
                        onChange={(e) => updateFormData(field.name, e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={field.name} className="text-right">
                        {field.placeholder}
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type={field.type || "text"}
                        value={dialogState.formData[field.name]?.toString() || ''}
                        onChange={(e) => updateFormData(field.name, e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  );
                }
              })}
            </div>
            
            <DialogFooter>
              <Button variant="secondary" onClick={closeDialog}>
                {dialogState.config.cancelText || "Cancel"}
              </Button>
              <Button onClick={handleConfirm}>
                {dialogState.config.confirmText || "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </UIDialog>
      )}
    </DialogContext.Provider>
  );
};