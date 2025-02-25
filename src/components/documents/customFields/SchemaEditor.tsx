import React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Plus, Trash2 } from "lucide-react";
import { SchemaField, FieldType } from '@/types/schema';
import { Trans } from "@lingui/macro";
import { Button, Input, Switch } from '@/components/ui';

interface SchemaEditorProps {
  fields: SchemaField[];
  onChange: (fields: SchemaField[]) => void;
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({ fields, onChange }) => {
  const addField = () => {
    const newField: SchemaField = {
      key: '',
      name: '',
      type: 'string',
      validation: {
        required: false
      },
      displayOptions: {
        showInList: false,
        showInDetail: true
      }
    };
    onChange([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<SchemaField>) => {
    const updatedFields = fields.map((field, i) =>
      i === index ? { ...field, ...updates } : field
    );
    onChange(updatedFields);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const fieldTypes: FieldType[] = ['string', 'number', 'date', 'boolean', 'select'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium"><Trans>Custom Fields</Trans></h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addField}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <Trans>Add Field</Trans>
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium"><Trans>Field Name</Trans></label>
                  <Input
                    value={field.name}
                    onChange={e => {
                      const newName = e.target.value;
                      updateField(index, {
                        name: newName,
                        key: newName.trim() ? newName.trim().toLowerCase() : field.key,
                      });
                    }}
                    placeholder="Enter field name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium"><Trans>Field Type</Trans></label>
                  <Select
                    value={field.type}
                    onValueChange={value =>
                      updateField(index, { type: value as FieldType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.validation?.required}
                    onCheckedChange={checked =>
                      updateField(index, {
                        validation: { ...field.validation, required: checked },
                      })
                    }
                  />
                  <label className="text-sm"><Trans>Required field</Trans></label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.displayOptions?.showInList}
                    onCheckedChange={checked =>
                      updateField(index, {
                        displayOptions: { 
                          ...field.displayOptions,
                          showInList: checked 
                        }
                      })
                    }
                  />
                  <label className="text-sm"><Trans>Show in list</Trans></label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.displayOptions?.showInDetail}
                    onCheckedChange={checked =>
                      updateField(index, {
                        displayOptions: { 
                          ...field.displayOptions,
                          showInDetail: checked 
                        }
                      })
                    }
                  />
                  <label className="text-sm"><Trans>Show in detail</Trans></label>
                </div>
              </div>

              {field.type === 'select' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium"><Trans>Options</Trans></label>
                  <Input
                    value={field.validation?.options?.join(', ') || ''}
                    onChange={e =>
                      updateField(index, {
                        validation: {
                          ...field.validation,
                          options: e.target.value.split(',').map(o => o.trim()),
                        },
                      })
                    }
                    placeholder="Enter options, separated by commas"
                  />
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeField(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemaEditor;