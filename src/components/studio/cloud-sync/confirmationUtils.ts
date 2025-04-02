// src/utils/cloud-sync/confirmationUtils.ts

/**
 * Interface for confirmation dialog data
 */
export interface ConfirmationData {
    isVisible: boolean;
    title: string;
    message: string;
    action: () => void;
  }
  
  /**
   * Creates initial confirmation dialog state
   */
  export const initialConfirmationState: ConfirmationData = {
    isVisible: false,
    title: "",
    message: "",
    action: () => {},
  };
  
  /**
   * Creates a confirmation dialog configuration
   */
  export const createConfirmation = (
    title: string,
    message: string,
    action: () => void
  ): ConfirmationData => {
    return {
      isVisible: true,
      title,
      message,
      action,
    };
  };