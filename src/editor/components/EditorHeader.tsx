import React from "react";
import { Save, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EditorHeader: React.FC<{
  title: string;
  configId: string;
  isDirty: boolean;
  onSave: () => void;
}> = ({ title, configId, isDirty, onSave }) => {
  const nav = useNavigate();
  const goBack = () => !isDirty || confirm("Masz niezapisane zmiany. Wyjść?") && nav(-1);
  return (
    <header className="bg-white border-b px-4 h-14 flex justify-between items-center">
      <div className="flex items-center">
        <button onClick={goBack} className="mr-3 text-gray-500"><ArrowLeft className="h-5 w-5" /></button>
        <button onClick={() => nav(`/${configId}`)} className="mr-4 text-gray-500"><Home className="h-5 w-5" /></button>
        <h1 className="text-lg font-medium">{title}{isDirty && <span className="text-sm text-red-500 ml-2">(niezapisane)</span>}</h1>
      </div>
      <button onClick={onSave} disabled={!isDirty} className={`px-4 py-1.5 rounded ${isDirty ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
        <Save className="h-4 w-4 mr-1.5 inline" /> Zapisz
      </button>
    </header>
  );
};
