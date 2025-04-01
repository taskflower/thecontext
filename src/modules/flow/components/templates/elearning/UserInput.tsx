// src/modules/flow/components/templates/elearning/UserInput.tsx
import React from "react";
import { Send } from "lucide-react";
import { UserInputProps } from "../../interfaces";
import { Button } from "@/components/ui/button";

const UserInput: React.FC<UserInputProps> = ({
  value,
  onChange,
  placeholder = "Type your answer...",
}) => {
  return (
    <div className="space-y-4 max-w-lg mx-auto p-4 bg-card rounded-xl">
      <p className="font-medium text-sm text-center mb-2">Your response</p>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 pr-12 h-24 bg-background border-2 border-primary/30 rounded-lg text-foreground focus:outline-none focus:border-primary resize-none text-sm"
        />
        
        <Button 
          type="button"
          className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserInput;