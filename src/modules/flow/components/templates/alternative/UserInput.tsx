// src/modules/flow/components/templates/alternative/UserInput.tsx
import React from "react";
import { UserCircle, Send } from "lucide-react";
import { UserInputProps } from "../../interfaces";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const UserInput: React.FC<UserInputProps> = ({
  value,
  onChange,
  placeholder = "Type your message...",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Command+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      // Trigger the form submission - Usually handled by the parent component
      document.getElementById('next-button')?.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-secondary/60 text-secondary-foreground">
          <UserCircle className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-foreground">Your Response</span>
      </div>
      
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="min-h-32 p-4 bg-background border-input focus-visible:ring-ring text-foreground resize-none rounded-lg shadow-sm"
        />
        <div className="absolute right-3 bottom-3">
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
            title="Press Ctrl+Enter to submit"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute left-3 bottom-2 text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 border rounded text-xs bg-muted">Ctrl</kbd>
          <span className="mx-1">+</span>
          <kbd className="px-1.5 py-0.5 border rounded text-xs bg-muted">Enter</kbd>
          <span className="ml-1">to submit</span>
        </div>
      </div>
    </div>
  );
};

export default UserInput;