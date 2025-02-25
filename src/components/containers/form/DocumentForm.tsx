// components/form/DocumentForm.tsx
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IContainer } from '@/utils/containers/types';
import { useDocumentForm } from '@/hooks/useDocumentForm';
import { Input } from '@/components/ui';
import { CustomFieldInput } from './CustomFieldInput';


interface DocumentFormProps {
  container: IContainer;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({ container }) => {
  const {
    title,
    setTitle,
    content,
    setContent,
    customFields,
    setCustomFields,
    selectedSchemaId,
    setSelectedSchemaId,
    handleSubmit
  } = useDocumentForm(container.id);

  const selectedSchema = container.schemas.find(s => s.id === selectedSchemaId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="schema">Schema</Label>
        <select
          id="schema"
          value={selectedSchemaId}
          onChange={(e) => setSelectedSchemaId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select schema...</option>
          {container.schemas.map((schema) => (
            <option key={schema.id} value={schema.id}>
              {schema.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Input
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full"
        />
      </div>

      {selectedSchema && (
        <div className="space-y-4">
          <h3 className="font-medium">Custom Fields</h3>
          {selectedSchema.fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.name}</Label>
              <CustomFieldInput
                field={field}
                value={customFields[field.name]}
                onChange={(value) =>
                  setCustomFields((prev) => ({
                    ...prev,
                    [field.name]: value
                  }))
                }
              />
            </div>
          ))}
        </div>
      )}

      <Button type="submit" className="w-full">Add Document</Button>
    </form>
  );
};