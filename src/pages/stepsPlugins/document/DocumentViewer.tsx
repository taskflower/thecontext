// src/pages/stepsPlugins/document/DocumentViewer.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, Copy, RefreshCw } from "lucide-react";
import { ViewerProps } from "../types";
import { useDataStore } from "@/store";

export default function DocumentViewer({ step, onComplete }: ViewerProps) {
  const { addDocItem } = useDataStore();
  const [content, setContent] = useState(step.result?.content || step.config?.template || '');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [charCount, setCharCount] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const minLength = step.config?.minLength || 0;
  const maxLength = step.config?.maxLength || 10000;
  const suggestions = step.config?.suggestions || [];
  const format = step.config?.format || 'markdown';
  const title = step.config?.title || step.title || 'Document';

  useEffect(() => {
    setCharCount(content.length);
    setIsValid(content.length >= minLength && content.length <= maxLength);
    setError(
      content.length < minLength
        ? `Document must be at least ${minLength} characters`
        : content.length > maxLength
        ? `Document exceeds maximum length of ${maxLength} characters`
        : null
    );
  }, [content, minLength, maxLength]);

  const handleSubmit = () => {
    if (!isValid) return;
    
    // Create document result for the step
    const result = { 
      content, 
      format, 
      charCount,
      completedAt: new Date().toISOString()
    };
    
    // Also create a document in the document store
    const currentTime = new Date().toISOString();
    const docItem = {
      id: `doc-${Date.now()}`,
      title: `${title} - ${new Date().toLocaleDateString()}`,
      content,
      metaKeys: ["auto-generated", step.taskId, format],
      schema: {},
      folderId: "root", // Domyślnie do głównego folderu
      createdAt: currentTime,
      updatedAt: currentTime
    };
    
    // Dodaj dokument do store'a
    addDocItem(docItem);
    
    // Zakończ krok
    onComplete(result);
  };

  const handleUseSuggestion = (suggestion: string) => {
    setContent((current: string) => current + (current.endsWith('\n') || current === '' ? '' : '\n\n') + suggestion);
  };

  const handleReset = () => {
    setContent(step.config?.template || '');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{step.config?.title || step.title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant={format === 'markdown' ? 'default' : format === 'html' ? 'secondary' : 'outline'}>
            {format === 'markdown' ? 'Markdown' : format === 'html' ? 'HTML' : 'Plain Text'}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleCopy} title="Copy to clipboard">
            <Copy size={14} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} title="Reset to template">
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">{step.config?.description || step.description}</p>

      {suggestions.length > 0 && (
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHints(!showHints)}
            className="text-xs flex items-center gap-1 mb-2"
          >
            <Info size={14} />
            {showHints ? 'Hide Suggestions' : 'Show Suggestions'}
          </Button>
          
          {showHints && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              {suggestions.map((suggestion: string, idx: number) => (
                <Button 
                  key={idx}
                  variant="outline" 
                  size="sm" 
                  className="justify-start text-left text-xs h-auto py-2 px-3 whitespace-normal"
                  onClick={() => handleUseSuggestion(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[300px] font-mono text-sm"
        placeholder="Enter your document content here..."
      />

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          {error ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle size={12} />
              {error}
            </Badge>
          ) : isValid ? (
            <Badge variant="outline" className="flex items-center gap-1 text-green-600">
              <CheckCircle size={12} />
              Valid
            </Badge>
          ) : null}
        </div>
        <div className="text-muted-foreground">
          {charCount}/{maxLength} characters
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full mt-4"
      >
        Submit Document
      </Button>
    </div>
  );
}