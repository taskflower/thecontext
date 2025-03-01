// src/pages/stepsPlugins/aiContent/components/SubmitButton.tsx
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isLoading: boolean;
  content: string;
  handleSubmit: () => void;
}

export function SubmitButton({ isLoading, content, handleSubmit }: SubmitButtonProps) {
  return (
    <Button 
      onClick={handleSubmit}
      disabled={isLoading || !content}
      className="w-full mt-4"
    >
      Complete Step
    </Button>
  );
}
