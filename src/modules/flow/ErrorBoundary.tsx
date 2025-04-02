import React, { Component, ErrorInfo, ReactNode } from 'react';
import errorService, { ErrorCode } from '@/services/ErrorService';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary for the flow module
 * Catches rendering errors and displays a fallback UI
 */
class FlowErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to error service
    errorService.handleError(
      errorService.createError(
        ErrorCode.PLUGIN_ERROR,
        error.message,
        { 
          componentStack: errorInfo.componentStack,
          jsStack: error.stack 
        }
      ),
      { showToast: true, logToConsole: true }
    );
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Default fallback UI
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
          <p className="mt-2 text-sm text-red-700">
            {this.state.error.message || "An error occurred in the plugin or component"}
          </p>
          <button
            onClick={this.resetError}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FlowErrorBoundary;