// src/components/EditConfigButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { useConfig } from "@/ConfigProvider";

interface EditConfigButtonProps {
  className?: string;
}

export const EditConfigButton: React.FC<EditConfigButtonProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const { configId } = useConfig();
  
  const goToEditor = () => {
    navigate(`/editor/${configId}`);
  };
  
  return (
    <button
      onClick={goToEditor}
      className={`flex items-center px-3 py-1.5 bg-gray-200 border border-gray-300 rounded-sm text-gray-600 text-sm hover:bg-gray-300 ${className}`}
      title="Edytuj konfigurację"
    >
      <Settings className="h-4 w-4 mr-1.5" />
      Edytuj konfigurację
    </button>
  );
};

export default EditConfigButton;