// src/modules/flow/components/templates/bigballs/UserInput.tsx
import React from "react";
import { UserInputProps } from "../../interfaces";

const UserInput: React.FC<UserInputProps> = ({
  value,
  onChange,
  placeholder = "Wprowadź swoje dane...",
}) => (
  <div className="px-5 py-3">
    <div className="bg-secondary rounded-md p-4 mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  </div>
);

export default UserInput;