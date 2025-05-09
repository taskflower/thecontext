import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-screen bg-gray-50">
          <div className="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Coś poszło nie tak</h3>
              <p className="text-sm text-gray-500">
                Wystąpił nieoczekiwany błąd podczas ładowania aplikacji.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Przeładuj stronę
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}