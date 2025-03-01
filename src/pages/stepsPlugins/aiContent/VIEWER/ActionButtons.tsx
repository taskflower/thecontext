// src/pages/stepsPlugins/aiContent/components/ActionButtons.tsx
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Copy, Save } from "lucide-react";

interface ActionButtonsProps {
  allowRetry: boolean;
  storeAsDocument: boolean;
  isLoading: boolean;
  generateContent: () => Promise<void>;
  handleCopy: () => void;
  handleDownload: () => void;
  saveAsDocument: () => void;
}

export function ActionButtons({
  allowRetry,
  storeAsDocument,
  isLoading,
  generateContent,
  handleCopy,
  handleDownload,
  saveAsDocument
}: ActionButtonsProps) {
  if (isLoading) {
    return null;
  }
  
  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-2">
        {allowRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateContent}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>
        )}
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        {storeAsDocument && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={saveAsDocument}
          >
            <Save className="h-4 w-4 mr-1" />
            Save as Doc
          </Button>
        )}
      </div>
    </div>
  );
}