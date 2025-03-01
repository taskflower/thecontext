// src/pages/stepsPlugins/aiContent/components/LoadingIndicator.tsx
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  isLoading: boolean;
}

export function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  if (!isLoading) {
    return null;
  }
  
  return (
    <div className="flex justify-center py-12">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Generating content...</p>
      </div>
    </div>
  );
}
