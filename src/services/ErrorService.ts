/**
 * ErrorService - Centralized error handling for the application
 * Provides utilities for processing, displaying, and logging errors consistently
 */
import { useToast } from '@/hooks/useToast';

// Error codes from backend
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INSUFFICIENT_TOKENS = 'INSUFFICIENT_TOKENS',
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  FIREBASE_AUTH_ERROR = 'FIREBASE_AUTH_ERROR',
  FIREBASE_DB_ERROR = 'FIREBASE_DB_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  PLUGIN_ERROR = 'PLUGIN_ERROR',
}

// Error response structure from backend
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Toast notification type for different severities
type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Error handler configuration
interface ErrorHandlerConfig {
  showToast?: boolean;
  logToConsole?: boolean;
  throwError?: boolean;
  notificationType?: NotificationType;
  duration?: number;
}

/**
 * Default error messages for known error codes
 * Maps error codes to user-friendly messages
 */
const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  [ErrorCode.UNAUTHORIZED]: 'You are not authorized to perform this action',
  [ErrorCode.INSUFFICIENT_TOKENS]: 'You don\'t have enough tokens for this operation',
  [ErrorCode.INVALID_INPUT]: 'The input provided is invalid',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded, please try again later',
  [ErrorCode.FIREBASE_AUTH_ERROR]: 'Authentication error occurred',
  [ErrorCode.FIREBASE_DB_ERROR]: 'Database operation failed',
  [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'The service is currently unavailable',
  [ErrorCode.PLUGIN_ERROR]: 'Plugin error occurred',
};

/**
 * Maps error codes to notification types for appropriate severity
 */
const ERROR_NOTIFICATION_TYPES: Record<string, NotificationType> = {
  [ErrorCode.UNAUTHORIZED]: 'error',
  [ErrorCode.INSUFFICIENT_TOKENS]: 'warning',
  [ErrorCode.INVALID_INPUT]: 'warning',
  [ErrorCode.NOT_FOUND]: 'error',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'warning',
  [ErrorCode.FIREBASE_AUTH_ERROR]: 'error',
  [ErrorCode.FIREBASE_DB_ERROR]: 'error',
  [ErrorCode.INTERNAL_ERROR]: 'error',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'error',
  [ErrorCode.PLUGIN_ERROR]: 'warning',
};

/**
 * ErrorService class for centralized error handling
 */
export class ErrorService {
  private toast;

  constructor() {
    const { toast } = useToast();
    this.toast = toast;
  }

  /**
   * Determines if an object is an ErrorResponse
   */
  private isErrorResponse(error: unknown): error is ErrorResponse {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    );
  }

  /**
   * Extracts error details from various error formats
   */
  private extractErrorDetails(error: unknown): ErrorResponse {
    // If it's already an ErrorResponse, return it
    if (this.isErrorResponse(error)) {
      return error;
    }

    // If it's an Error object
    if (error instanceof Error) {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: error.message,
        details: { stack: error.stack },
      };
    }

    // If it's a string
    if (typeof error === 'string') {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: error,
      };
    }

    // If it's a Response object from fetch API
    if (error instanceof Response) {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: `HTTP Error: ${error.status} ${error.statusText}`,
        details: { status: error.status },
      };
    }

    // Default case for unknown error types
    return {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Unknown error occurred',
      details: { originalError: error },
    };
  }

  /**
   * Gets a user-friendly message for an error code
   */
  private getUserFriendlyMessage(errorCode: string, defaultMessage: string): string {
    return DEFAULT_ERROR_MESSAGES[errorCode] || defaultMessage;
  }

  /**
   * Gets the appropriate notification type for an error code
   */
  private getNotificationType(errorCode: string): NotificationType {
    return ERROR_NOTIFICATION_TYPES[errorCode] || 'error';
  }

  /**
   * Shows a toast notification for the error
   */
  private showErrorNotification(
    errorDetails: ErrorResponse,
    config: ErrorHandlerConfig = {}
  ): void {
    const { notificationType = this.getNotificationType(errorDetails.code) } = config;
    
    this.toast({
      title: this.getUserFriendlyMessage(errorDetails.code, errorDetails.message),
      description: errorDetails.details?.retryAfter 
        ? `You can try again in ${errorDetails.details.retryAfter} seconds` 
        : undefined,
      variant: notificationType === 'error' ? 'destructive' : 'default',
      duration: config.duration || 5000,
    });
  }

  /**
   * Handles an error with customizable behavior
   */
  public handleError(
    error: unknown,
    config: ErrorHandlerConfig = { 
      showToast: true, 
      logToConsole: true,
      throwError: false 
    }
  ): ErrorResponse {
    const errorDetails = this.extractErrorDetails(error);
    
    // Log to console if configured
    if (config.logToConsole) {
      console.error('Error handled by ErrorService:', errorDetails);
    }
    
    // Show toast notification if configured
    if (config.showToast) {
      this.showErrorNotification(errorDetails, config);
    }
    
    // Throw the error if configured
    if (config.throwError) {
      throw new Error(errorDetails.message);
    }
    
    return errorDetails;
  }

  /**
   * Special handler for AI service specific errors
   */
  public handleAIError(error: unknown, serviceName: string): ErrorResponse {
    const errorDetails = this.extractErrorDetails(error);
    
    // Add AI service info to details
    errorDetails.details = {
      ...errorDetails.details,
      serviceName,
    };
    
    // Special handling for insufficient tokens in AI context
    if (errorDetails.code === ErrorCode.INSUFFICIENT_TOKENS) {
      this.toast({
        title: 'Insufficient tokens',
        description: 'You need more tokens to use this AI service',
        variant: 'destructive',
        action: {
          label: 'Get Tokens',
          onClick: () => window.location.href = '/pricing',
        },
      });
    } else {
      // Default error notification
      this.showErrorNotification(errorDetails);
    }
    
    console.error(`${serviceName} error:`, errorDetails);
    return errorDetails;
  }

  /**
   * Creates an ErrorResponse object
   */
  public createError(
    code: ErrorCode | string,
    message: string,
    details?: Record<string, unknown>
  ): ErrorResponse {
    return { code, message, details };
  }
}

// Create singleton instance
const errorService = new ErrorService();

export default errorService;