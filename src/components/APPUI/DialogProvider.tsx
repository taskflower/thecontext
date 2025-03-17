/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/dialog/DialogProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog as UIDialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Enhanced DialogField type to support more validation and customization
export interface DialogField {
  name: string;
  placeholder: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select';
  value?: string | number;
  options?: { value: string; label: string }[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
  };
}

// Define dialog configurations
export interface DialogConfig {
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
  errors: Record<string, string>;
}

interface DialogContextType {
  openDialog: (config: DialogConfig) => void;
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
    errors: {},
  });

  const openDialog = (config: DialogConfig) => {
    // Initialize form data with defaults from fields
    const formData: Record<string, any> = {};
    config.fields.forEach(field => {
      formData[field.name] = field.value ?? '';
    });

    setDialogState({
      config,
      isOpen: true,
      formData,
      errors: {},
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
      errors: {
        ...prev.errors,
        [key]: '', // Clear any previous errors for this field
      },
    }));
  };

  const validateForm = (): boolean => {
    if (!dialogState.config) return false;

    const newErrors: Record<string, string> = {};
    let isValid = true;

    dialogState.config.fields.forEach(field => {
      const value = dialogState.formData[field.name];
      const validation = field.validation;

      if (validation) {
        // Required check
        if (validation.required && (!value || value.toString().trim() === '')) {
          newErrors[field.name] = `${field.placeholder} is required`;
          isValid = false;
        }

        // Min/Max length for strings
        if (typeof value === 'string') {
          if (validation.minLength && value.length < validation.minLength) {
            newErrors[field.name] = `Minimum length is ${validation.minLength}`;
            isValid = false;
          }
          if (validation.maxLength && value.length > validation.maxLength) {
            newErrors[field.name] = `Maximum length is ${validation.maxLength}`;
            isValid = false;
          }
        }

        // Min/Max for numbers
        if (typeof value === 'number') {
          if (validation.min !== undefined && value < validation.min) {
            newErrors[field.name] = `Minimum value is ${validation.min}`;
            isValid = false;
          }
          if (validation.max !== undefined && value > validation.max) {
            newErrors[field.name] = `Maximum value is ${validation.max}`;
            isValid = false;
          }
        }

        // Pattern matching
        if (validation.pattern && typeof value === 'string' && !validation.pattern.test(value)) {
          newErrors[field.name] = `Invalid format`;
          isValid = false;
        }
      }
    });

    setDialogState(prev => ({
      ...prev,
      errors: newErrors,
    }));

    return isValid;
  };

  const handleConfirm = () => {
    if (validateForm() && dialogState.config?.onConfirm) {
      dialogState.config.onConfirm(dialogState.formData);
      closeDialog();
    }
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
                      <div className="col-span-3">
                        <Select
                          value={dialogState.formData[field.name]?.toString() || ''}
                          onValueChange={(value) => handleSelectChange(field.name, value)}
                        >
                          <SelectTrigger className="w-full">
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
                        {dialogState.errors[field.name] && (
                          <p className="text-destructive text-sm mt-1">
                            {dialogState.errors[field.name]}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                } else if (field.type === 'textarea') {
                  return (
                    <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={field.name} className="text-right">
                        {field.placeholder}
                      </Label>
                      <div className="col-span-3">
                        <Textarea
                          id={field.name}
                          value={dialogState.formData[field.name]?.toString() || ''}
                          onChange={(e) => updateFormData(field.name, e.target.value)}
                          className="w-full"
                        />
                        {dialogState.errors[field.name] && (
                          <p className="text-destructive text-sm mt-1">
                            {dialogState.errors[field.name]}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={field.name} className="text-right">
                        {field.placeholder}
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id={field.name}
                          name={field.name}
                          type={field.type || "text"}
                          value={dialogState.formData[field.name]?.toString() || ''}
                          onChange={(e) => updateFormData(field.name, e.target.value)}
                          className="w-full"
                        />
                        {dialogState.errors[field.name] && (
                          <p className="text-destructive text-sm mt-1">
                            {dialogState.errors[field.name]}
                          </p>
                        )}
                      </div>
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