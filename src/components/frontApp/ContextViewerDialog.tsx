import { ContextItem } from "@/modules/context";
import { detectContentType } from "@/modules/context/utils";
import { ArrowLeft, Copy, FileJson, FileText, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

export const ContextViewerDialog: React.FC<{
    item: ContextItem;
    onClose: () => void;
    onReturnToList: () => void;
  }> = ({ item, onClose, onReturnToList }) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const { type } = detectContentType(item.content);
    const isJson = type === "json";
  
    const handleCopyContent = () => {
      navigator.clipboard.writeText(item.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    };
  
    return (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 md:p-8"
        onClick={onClose}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <div
          className="bg-background border border-border rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ margin: 'auto', position: 'relative', transform: 'none' }}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              {isJson ? (
                <FileJson className="h-5 w-5 text-blue-500" />
              ) : (
                <FileText className="h-5 w-5 text-gray-500" />
              )}
              <span>Context: {item.title}</span>
            </h3>
            <button
              onClick={onClose}
              className="rounded-full h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
  
          <div className="p-4 flex-grow overflow-auto">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <label htmlFor="content" className="block text-sm font-medium">
                    {isJson ? (
                      <span>JSON Content <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded ml-1">JSON</span></span>
                    ) : (
                      "Content"
                    )}
                  </label>
                </div>
                <button 
                  onClick={handleCopyContent}
                  className="text-xs py-1 px-2 rounded bg-muted hover:bg-muted/80 text-foreground flex items-center transition-colors"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copySuccess ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className={`relative border border-border rounded-md bg-muted/30 ${isJson ? 'p-0' : 'p-3'}`}>
                {isJson ? (
                  <pre className="font-mono text-sm p-4 overflow-auto max-h-[50vh]">
                    {item.content}
                  </pre>
                ) : (
                  <div className="overflow-auto max-h-[50vh]">
                    <textarea
                      id="content"
                      name="content"
                      value={item.content}
                      rows={15}
                      className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 resize-none p-0"
                      readOnly
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
  
          <div className="flex justify-between p-4 border-t">
            <Button
              variant="outline"
              onClick={onReturnToList}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Context List
            </Button>
            
            <Button
              onClick={onClose}
              variant="default"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };