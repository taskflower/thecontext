/**
 * Context Editor Component
 * Form for creating and editing context items
 */
import React, { useState, useEffect } from 'react';
import { 
  ContextItem, 
  ContextContentType, 
  ContextVisibility, 
  SchemaStatus,
  CreateContextItemParams,
  UpdateContextItemParams
} from '../types';
import { useContextStore } from '../contextStore';

interface ContextEditorProps {
  workspaceId: string;
  item?: ContextItem | null;
  onSave: (params: CreateContextItemParams) => void;
  onCancel: () => void;
  className?: string;
}

const ContextEditor: React.FC<ContextEditorProps> = ({
  workspaceId,
  item,
  onSave,
  onCancel,
  className = ''
}) => {
  // Form state
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [content, setContent] = useState(item?.content || '');
  const [contentType, setContentType] = useState<ContextContentType>(
    item?.contentType || ContextContentType.TEXT
  );
  const [visibility, setVisibility] = useState<ContextVisibility>(
    item?.visibility || ContextVisibility.PRIVATE
  );
  const [schemaStatus, setSchemaStatus] = useState<SchemaStatus>(
    item?.schemaStatus || SchemaStatus.NONE
  );
  const [schema, setSchema] = useState(item?.schema || '');
  const [tags, setTags] = useState<string[]>(item?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contentValidationError, setContentValidationError] = useState<string | null>(null);
  
  // Context store
  const { validateItemContent, updateItem } = useContextStore();
  
  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setContent(item.content);
      setContentType(item.contentType);
      setVisibility(item.visibility);
      setSchemaStatus(item.schemaStatus);
      setSchema(item.schema || '');
      setTags(item.tags || []);
    } else {
      // Reset to defaults for new items
      setTitle('');
      setDescription('');
      setContent('');
      setContentType(ContextContentType.TEXT);
      setVisibility(ContextVisibility.PRIVATE);
      setSchemaStatus(SchemaStatus.NONE);
      setSchema('');
      setTags([]);
    }
    
    // Clear errors
    setErrors({});
    setContentValidationError(null);
  }, [item]);
  
  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    // Validate content based on type
    if (content.trim()) {
      const validation = validateItemContent(content, contentType);
      if (!validation.isValid) {
        setContentValidationError(
          validation.errors?.[0]?.message || 'Invalid content format'
        );
        return false;
      }
    } else {
      newErrors.content = 'Content is required';
    }
    
    // Validate schema if needed
    if (schemaStatus === SchemaStatus.COMPLEX && !schema.trim()) {
      newErrors.schema = 'Schema is required when Schema Status is Complex';
    }
    
    // Check if schema is valid JSON
    if (schema.trim() && schemaStatus === SchemaStatus.COMPLEX) {
      try {
        JSON.parse(schema);
      } catch (error) {
        newErrors.schema = 'Schema must be valid JSON';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Check if updating or creating
    if (item) {
      // Update existing item
      const params: UpdateContextItemParams = {
        id: item.id,
        title,
        description,
        content,
        contentType,
        visibility,
        schemaStatus,
        schema: schema || undefined,
        tags
      };
      
      updateItem(params);
    } else {
      // Create new item
      const params: CreateContextItemParams = {
        workspaceId,
        title,
        description,
        content,
        contentType,
        visibility,
        schemaStatus,
        schema: schema || undefined,
        tags
      };
      
      onSave(params);
    }
  };
  
  // Handle tag management
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {item ? 'Edit Context Item' : 'Create New Context Item'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="Enter description (optional)"
            />
          </div>
        </div>
        
        {/* Content Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-end">
            <label className="block text-sm font-medium text-gray-700">
              Content <span className="text-red-500">*</span>
            </label>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContextContentType)}
                className="p-1 text-sm border border-gray-300 rounded-md"
              >
                <option value={ContextContentType.TEXT}>Plain Text</option>
                <option value={ContextContentType.JSON}>JSON</option>
                <option value={ContextContentType.MARKDOWN}>Markdown</option>
                <option value={ContextContentType.HTML}>HTML</option>
                <option value={ContextContentType.XML}>XML</option>
                <option value={ContextContentType.YAML}>YAML</option>
                <option value={ContextContentType.CSV}>CSV</option>
              </select>
            </div>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setContentValidationError(null);
            }}
            className={`w-full p-2 border rounded-md font-mono text-sm ${
              errors.content || contentValidationError ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={10}
            placeholder={`Enter content in ${contentType} format`}
          />
          
          {(errors.content || contentValidationError) && (
            <p className="text-sm text-red-500">
              {errors.content || contentValidationError}
            </p>
          )}
          
          {contentType === ContextContentType.JSON && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  try {
                    // Format JSON to make it more readable
                    const formatted = JSON.stringify(JSON.parse(content), null, 2);
                    setContent(formatted);
                  } catch (e) {
                    // If not valid JSON, don't do anything
                  }
                }}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Format JSON
              </button>
            </div>
          )}
        </div>
        
        {/* Settings Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-md font-medium text-gray-700">Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ContextVisibility)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={ContextVisibility.PRIVATE}>Private (only you)</option>
                <option value={ContextVisibility.WORKSPACE}>Workspace (all workspace members)</option>
                <option value={ContextVisibility.PUBLIC}>Public (anyone)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schema Status
              </label>
              <select
                value={schemaStatus}
                onChange={(e) => setSchemaStatus(e.target.value as SchemaStatus)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={SchemaStatus.NONE}>No Schema</option>
                <option value={SchemaStatus.SIMPLE}>Simple Validation</option>
                <option value={SchemaStatus.COMPLEX}>JSON Schema</option>
              </select>
            </div>
          </div>
          
          {schemaStatus === SchemaStatus.COMPLEX && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Schema
              </label>
              <textarea
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                className={`w-full p-2 border rounded-md font-mono text-sm ${
                  errors.schema ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={6}
                placeholder="Enter JSON schema definition"
              />
              {errors.schema && (
                <p className="mt-1 text-sm text-red-500">{errors.schema}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Tags Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-md font-medium text-gray-700">Tags</h3>
          
          <div className="flex">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow p-2 border border-gray-300 rounded-l-md"
              placeholder="Add tags"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div 
                key={tag}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  &times;
                </button>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-gray-500">No tags added yet</p>
            )}
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {item ? 'Save Changes' : 'Create Context Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContextEditor;