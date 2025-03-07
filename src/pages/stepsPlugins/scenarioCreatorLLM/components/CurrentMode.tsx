/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/components/CurrentMode.tsx
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

interface CurrentModeProps {
  mockResponse: boolean;
  user: any;
  authLoading: boolean;
}

export function CurrentMode({ mockResponse, user, authLoading }: CurrentModeProps) {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50">
        <div className="text-sm">
          <span className="font-medium">Current mode: </span>
          {mockResponse ? "Using mock data" : "Using LLM API"}
        </div>
      </Alert>

     
    </div>
  );
}
