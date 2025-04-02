import React from 'react';
import { AlertCircle, LogIn } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ErrorResponse } from '@/services/ErrorService';

interface AuthErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: ErrorResponse | null;
  onLogin: () => void;
  onCancel: () => void;
}

/**
 * Dialog component for displaying authentication errors
 * Provides options to log in or continue anonymously
 */
const AuthErrorDialog: React.FC<AuthErrorDialogProps> = ({
  open,
  onOpenChange,
  error,
  onLogin,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Authentication Required
          </DialogTitle>
          <DialogDescription>
            {error?.message || 'You need to be logged in to use this feature.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-muted/30 rounded-md">
          <p className="text-sm">
            This action requires authentication. Would you like to log in now, or continue using limited functionality?
          </p>
          
          {error?.details && (
            <div className="mt-2 text-xs text-muted-foreground">
              <p>Additional details:</p>
              <pre className="p-2 bg-background rounded text-xs mt-1 overflow-x-auto">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onCancel}>
            Continue Limited
          </Button>
          <Button onClick={onLogin} className="gap-1">
            <LogIn className="h-4 w-4" />
            Log In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthErrorDialog;