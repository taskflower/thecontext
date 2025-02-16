// src/components/documents/MarkdownComponents.tsx
import { lazy, Suspense } from 'react';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// Osobne importy dla edytora i podglądu
const MDEditor = lazy(() => import('@uiw/react-md-editor'));
const MDPreview = lazy(() => 
  import('@uiw/react-markdown-preview').then(mod => ({ default: mod.default }))
);

// Komponent do podglądu
export const MarkdownPreview = ({ content }: { content: string }) => {
  return (
    <Suspense fallback={<div className="p-4 border rounded-md bg-muted">Ładowanie...</div>}>
      <div data-color-mode="light">
        <MDPreview 
          source={content || ""} 
          className="p-4 border rounded-md"
        />
      </div>
    </Suspense>
  );
};

// Komponent do edycji
interface MarkdownEditorProps {
  content: string;
  onChange: (value: string | undefined) => void;
}

export const MarkdownEditor = ({ content, onChange }: MarkdownEditorProps) => {
  return (
    <Suspense 
      fallback={
        <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted">
          Ładowanie edytora...
        </div>
      }
    >
      <div data-color-mode="light">
        <MDEditor
          value={content}
          onChange={onChange}
          height={400}
          preview="edit"
        />
      </div>
    </Suspense>
  );
};