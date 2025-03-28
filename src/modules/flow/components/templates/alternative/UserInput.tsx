// src/modules/flow/components/templates/alternative/UserInput.tsx
import React from "react";
import { UserInputProps } from "../../interfaces";

const UserInput: React.FC<UserInputProps> = ({
  value,
  onChange,
  placeholder = "Wpisz swoją wiadomość...",
}) => (
  <div className="mt-6">
    <p className="text-sm font-medium text-muted-foreground mb-2">
      Twoja odpowiedź:
    </p>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
      rows={3}
    ></textarea>
  </div>
);

export default UserInput;