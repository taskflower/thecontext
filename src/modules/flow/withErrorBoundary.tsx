import React from 'react';
import FlowErrorBoundary from './ErrorBoundary';
import { ErrorFallback } from '@/components/studio/ErrorFallback';

/**
 * HOC that wraps a component with the Flow error boundary
 * Provides standardized error handling for flow components
 * 
 * @param Component - Component to wrap with error boundary
 * @param options - Optional configuration for error handling
 * @returns Wrapped component with error handling
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    title?: string;
    description?: string;
    showDetails?: boolean;
  } = {}
): React.FC<P> {
  const { 
    title = 'Plugin Error', 
    description = 'There was a problem with this flow component',
    showDetails = false
  } = options;
  
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <FlowErrorBoundary
        fallback={({ error, resetError }) => (
          <ErrorFallback
            error={error}
            resetError={resetError}
            title={title}
            description={description}
            showDetails={showDetails}
          />
        )}
      >
        <Component {...props} />
      </FlowErrorBoundary>
    );
  };
  
  // Copy display name and set new name
  const displayName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

export default withErrorBoundary;