// src/modules/flow/components/templates/default/UserInput.tsx
import React from "react";
import { UserInputProps } from "../../interfaces";
import { Textarea } from "@/components/ui/textarea";

const UserInput: React.FC<UserInputProps> = ({
  value,
  onChange,
  placeholder = "Type your message...",
}) => (
  <div className="mt-6 space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-primary">Your response:</span>
    </div>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-4 bg-background border-input rounded-lg text-foreground focus-visible:ring-ring focus-visible:ring-offset-card resize-none"
      rows={4}
    />
  </div>
);

export default UserInput;