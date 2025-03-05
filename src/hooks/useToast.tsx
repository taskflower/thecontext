/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';

export type ToastVariant = "default" | "destructive" | "success";

export type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

// Mapping shadcn/ui toast variants to sonner variants
const variantMap = {
  default: "success",
  destructive: "error",
  success: "success"
};

export function useToast() {
  const toast = ({ 
    title, 
    description, 
    variant = "default", 
    duration,
    action
  }: ToastOptions) => {
    const sonnerVariant = variantMap[variant] as "success" | "error" | "info";
    
    const options: any = {
      duration,
    };
    
    if (action) {
      options.action = {
        label: action.label,
        onClick: action.onClick
      };
    }

    // Use title as message if provided, otherwise use description
    const message = title || "";
    const descriptionText = title ? description : "";
    
    return sonnerToast[sonnerVariant](message, {
      description: descriptionText,
      ...options
    });
  };

  return {
    toast
  };
}

// Export Sonner's Toaster component for use in layouts
export { SonnerToaster as Toaster };