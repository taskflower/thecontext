// src/modules/editor/components/WidgetCard.tsx
import { FieldWidget } from '@/themes/default/widgets/form/FieldWidget';
import { WIDGET_SCHEMAS } from '../schemas/widgetSchemas';

interface WidgetCardProps {
  widget: any;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (widget: any) => void;
  onRemove: () => void;
}

export default function WidgetCard({ 
  widget, 

  isSelected, 
  onSelect, 
  onUpdate, 
  onRemove 
}: WidgetCardProps) {
  const schema = WIDGET_SCHEMAS[widget.tplFile as keyof typeof WIDGET_SCHEMAS];

  const handleFieldChange = (path: string, value: any) => {
    const keys = path.split('.');
    const updatedWidget = { ...widget };
    
    if (keys.length === 1) {
      updatedWidget[keys[0]] = value;
    } else if (keys.length === 2 && keys[0] === 'attrs') {
      updatedWidget.attrs = { ...updatedWidget.attrs, [keys[1]]: value };
    }
    
    onUpdate(updatedWidget);
  };

  return (
    <div className="border border-zinc-200 rounded-lg">
      <div 
        className="p-4 cursor-pointer hover:bg-zinc-50 flex justify-between items-center"
        onClick={onSelect}
      >
        <div>
          <span className="font-medium">{widget.tplFile}</span>
          <span className="text-zinc-500 ml-2">- {widget.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Remove
          </button>
          <span className="text-zinc-400">
            {isSelected ? '−' : '+'}
          </span>
        </div>
      </div>
      
      {isSelected && schema && (
        <div className="border-t border-zinc-200 p-4 space-y-4">
          {/* Title field */}
          <FieldWidget
            field={{ ...schema.title, key: 'title' }}
            value={widget.title}
            onChange={(key, value) => handleFieldChange(key, value)}
          />
          
          {/* Attrs fields */}
          {schema.attrs.properties && Object.entries(schema.attrs.properties).map(([key, field]: any) => (
            <FieldWidget
              key={key}
              field={{ ...field, key }}
              value={widget.attrs?.[key] ?? ''}
              onChange={(_, value) => handleFieldChange(`attrs.${key}`, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}