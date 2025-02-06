// src/components/documents/DocumentForm.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MDEditor from "@uiw/react-md-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentFormProps {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitButtonText: string;
  formTitle: string;
}

export const DocumentForm = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSubmit,
  onCancel,
  submitButtonText,
  formTitle
}: DocumentFormProps) => {
  return (
    <Card className="border-0 md:border shadow-none md:shadow">
      <CardHeader>
        <CardTitle>{formTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Document title"
              required
            />
          </div>
          <div className="space-y-2" data-color-mode="light">
            <label className="text-sm font-medium">Content</label>
            <MDEditor
              value={content}
              onChange={(val) => onContentChange(val || "")}
              height={400}
              preview="edit"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{submitButtonText}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};