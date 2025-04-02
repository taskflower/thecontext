import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

/**
 * Generic error fallback component to display in error boundaries
 * Provides options for customization and error details display
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = 'An error occurred',
  description = 'We encountered a problem while trying to process your request.',
  showDetails = false,
}) => {
  return (
    <Card className="w-full max-w-md mx-auto border-red-200 shadow-md">
      <CardHeader className="bg-red-50 border-b border-red-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-700">{title}</CardTitle>
        </div>
        <CardDescription className="text-red-600">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 mb-2">Error message:</p>
        <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-red-800 overflow-auto">
          {error.message || 'Unknown error'}
        </div>
        
        {showDetails && error.stack && (
          <>
            <p className="text-sm text-gray-600 mt-4 mb-2">Stack trace:</p>
            <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs font-mono overflow-auto max-h-32 text-gray-800">
              {error.stack.split('\n').map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 border-t border-gray-100">
        <Button 
          variant="outline" 
          onClick={resetError} 
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button 
          variant="secondary"
          onClick={() => window.location.reload()}
          className="text-sm"
        >
          Reload Page
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ErrorFallback;