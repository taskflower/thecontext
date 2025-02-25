/* eslint-disable @typescript-eslint/no-explicit-any */
// components/management/SchemaCreator.tsx

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { useContainerStore } from "@/store/containerStore";
import { ICustomFieldSchema, IDocumentSchema } from "@/utils/containers/types";
import { useState } from "react";


interface SchemaCreatorProps {
  containerId: string;
}

export const SchemaCreator: React.FC<SchemaCreatorProps> = ({ containerId }) => {
  const [schemaName, setSchemaName] = useState('');
  const [fields, setFields] = useState<ICustomFieldSchema[]>([]);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<'string' | 'number' | 'boolean' | 'date'>('string');
  const [isRequired, setIsRequired] = useState(false);

  const addSchema = useContainerStore(state => state.addSchema);

  const handleAddField = () => {
    if (!fieldName.trim()) return;

    const newField: ICustomFieldSchema = {
      name: fieldName,
      type: fieldType,
      required: isRequired
    };

    setFields([...fields, newField]);
    setFieldName('');
    setFieldType('string');
    setIsRequired(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemaName.trim() || fields.length === 0) return;

    const newSchema: IDocumentSchema = {
      id: Math.random().toString(36).substr(2, 9),
      name: schemaName,
      fields
    };

    addSchema(containerId, newSchema);
    setSchemaName('');
    setFields([]);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Create Schema</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="schemaName">Schema Name</Label>
            <Input
              id="schemaName"
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value)}
              placeholder="Enter schema name"
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Add Fields</h3>
            <div className="space-y-2">
              <Input
                placeholder="Field name"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full"
              />
              <select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value as any)}
                className="w-full p-2 border rounded"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
              </select>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                />
                <Label htmlFor="required">Required</Label>
              </div>
              <Button 
                type="button" 
                onClick={handleAddField}
                className="w-full"
              >
                Add Field
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Current Fields:</h4>
            {fields.map((field, index) => (
              <div key={index} className="p-2 border rounded mb-2">
                <p>Name: {field.name}</p>
                <p>Type: {field.type}</p>
                <p>Required: {field.required ? 'Yes' : 'No'}</p>
              </div>
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!schemaName || fields.length === 0}
          >
            Create Schema
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};