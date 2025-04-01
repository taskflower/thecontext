// src/modules/flow/components/templates/bigballs/UserInput.tsx
import React from "react";
import { UserInputProps } from "../../interfaces";

const UserInput: React.FC<UserInputProps> = ({
  value,
  onChange,
  placeholder = "Wprowadź swoje dane...",
}) => (
  <div className="px-5 py-3">
    <div className="bg-gray-100 rounded-md p-4 mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black"
      />
    </div>
  </div>
);

export default UserInput;
