import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/utils/utils';
import { Button } from './button';
import { ErrorResponse } from '@/services/ErrorHandlerService';


export type ErrorDisplayVariant = 'error' | 'warning' | 'info';

export interface ErrorDisplayProps {
  // Dane błędu
  error: ErrorResponse;
  
  // Wygląd komponentu
  variant?: ErrorDisplayVariant;
  className?: string;
  compact?: boolean;
  
  // Callback przy kliknięciu na akcje
  onClose?: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  
  // Teksty przycisków
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  
  // Czy pokazywać szczegóły techniczne
  showDetails?: boolean;
}

/**
 * Komponent do wyświetlania błędów w jednolity sposób
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  variant = 'error',
  className = '',
  compact = false,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
  showDetails = false,
}) => {
  // Ikona w zależności od wariantu
  const IconComponent = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[variant];
  
  // Stylowanie w zależności od wariantu
  const variantStyles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  }[variant];
  
  // Stylowanie ikony
  const iconStyles = {
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  }[variant];
  
  return (
    <div className={cn(
      'border rounded-md shadow-sm',
      variantStyles,
      compact ? 'p-2' : 'p-3',
      className
    )}>
      <div className="flex gap-2 items-start">
        {/* Ikona */}
        <IconComponent className={cn('flex-shrink-0', iconStyles, compact ? 'h-4 w-4' : 'h-5 w-5')} />
        
        {/* Treść */}
        <div className="flex-1">
          {/* Tytuł i przycisk zamknięcia */}
          <div className="flex justify-between items-start">
            <h3 className={cn(
              'font-medium',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {error.code && error.code !== 'INTERNAL_ERROR' 
                ? error.code.replace(/_/g, ' ').toLowerCase() 
                : 'Błąd'}
            </h3>
            
            {onClose && (
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1"
              >
                <X className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
              </button>
            )}
          </div>
          
          {/* Komunikat błędu */}
          <p className={cn(
            compact ? 'text-xs mt-0.5' : 'text-xs mt-1'
          )}>
            {error.message}
          </p>
          
          {/* Szczegóły techniczne */}
          {showDetails && error.details && (
            <div className="mt-2">
              <details className="text-xs">
                <summary className="cursor-pointer">Szczegóły błędu</summary>
                <pre className={cn(
                  'mt-1 p-1 rounded bg-white/50 overflow-auto',
                  compact ? 'text-[10px]' : 'text-xs'
                )}>
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            </div>
          )}
          
          {/* Przyciski akcji */}
          {(onPrimaryAction || onSecondaryAction) && (
            <div className={cn(
              'flex gap-2',
              compact ? 'mt-1.5' : 'mt-2'
            )}>
              {onSecondaryAction && secondaryActionLabel && (
                <Button
                  variant="ghost"
                  size={compact ? 'sm' : 'default'}
                  className="h-auto py-1 px-2 text-xs"
                  onClick={onSecondaryAction}
                >
                  {secondaryActionLabel}
                </Button>
              )}
              
              {onPrimaryAction && primaryActionLabel && (
                <Button
                  variant={variant === 'error' ? 'destructive' : 'default'}
                  size={compact ? 'sm' : 'default'}
                  className="h-auto py-1 px-2 text-xs"
                  onClick={onPrimaryAction}
                >
                  {primaryActionLabel}
                </Button>
              )}
              
              {/* Specjalne przyciski w zależności od kodu błędu */}
              {!onPrimaryAction && !primaryActionLabel && error.code === 'INSUFFICIENT_TOKENS' && (
                <Button
                  variant="default"
                  size={compact ? 'sm' : 'default'}
                  className="h-auto py-1 px-2 text-xs"
                  onClick={() => window.location.href = '/pricing'}
                >
                  Kup tokeny
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;