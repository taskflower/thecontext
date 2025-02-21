// src/components/documents/document/editor/DocumentEditor.tsx

import { MarkdownEditor } from "../../MarkdownComponents";


interface DocumentEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export const DocumentEditor = ({ content, onChange }: DocumentEditorProps) => {
  const handleChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <div className="w-full">
      <MarkdownEditor 
        content={content}
        onChange={handleChange}
      />
    </div>
  );
};