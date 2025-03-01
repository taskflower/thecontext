// src/pages/stepsPlugins/aiContent/components/ContentDisplay.tsx
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContentDisplayProps {
  content: string;
  setContent: (content: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function ContentDisplay({ content, setContent, isLoading, error }: ContentDisplayProps) {
  if (isLoading) {
    return null;
  }
  
  return (
    <>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[300px] font-mono text-sm"
        placeholder="AI-generated content will appear here..."
      />
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}