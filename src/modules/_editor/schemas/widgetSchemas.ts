// src/modules/editor/schemas/widgetSchemas.ts
export const WIDGET_SCHEMAS = {
    ButtonWidget: {
      title: { type: 'string', label: 'Button Text', required: true },
      attrs: {
        type: 'object',
        properties: {
          navigationPath: { type: 'string', label: 'Navigation Path', required: true },
          variant: { 
            type: 'string', 
            label: 'Variant',
            enum: ['primary', 'secondary', 'default'],
            enumLabels: { primary: 'Primary', secondary: 'Secondary', default: 'Default' }
          },
          colSpan: { 
            type: 'string', 
            label: 'Column Span',
            enum: ['1', '2', '3', '4', '5', '6', 'full'],
            enumLabels: { 
              '1': '1 Column', 
              '2': '2 Columns', 
              '3': '3 Columns', 
              '4': '4 Columns', 
              '5': '5 Columns', 
              '6': '6 Columns', 
              'full': 'Full Width' 
            }
          }
        }
      }
    },
    InfoWidget: {
      title: { type: 'string', label: 'Widget Title', required: true },
      attrs: {
        type: 'object',
        properties: {
          content: { type: 'string', label: 'Content', fieldType: 'textarea', required: true },
          description: { type: 'string', label: 'Description' },
          variant: {
            type: 'string',
            label: 'Variant',
            enum: ['default', 'info', 'success', 'warning', 'error'],
            enumLabels: { 
              default: 'Default', 
              info: 'Info', 
              success: 'Success', 
              warning: 'Warning', 
              error: 'Error' 
            }
          },
          colSpan: { 
            type: 'string', 
            label: 'Column Span',
            enum: ['1', '2', '3', '4', '5', '6', 'full']
          }
        }
      }
    },
    TitleWidget: {
      title: { type: 'string', label: 'Title Text', required: true },
      attrs: {
        type: 'object',
        properties: {
          description: { type: 'string', label: 'Description' },
          size: {
            type: 'string',
            label: 'Size',
            enum: ['small', 'medium', 'large'],
            enumLabels: { small: 'Small', medium: 'Medium', large: 'Large' }
          },
          align: {
            type: 'string',
            label: 'Alignment',
            enum: ['left', 'center', 'right'],
            enumLabels: { left: 'Left', center: 'Center', right: 'Right' }
          },
          colSpan: { 
            type: 'string', 
            label: 'Column Span', 
            enum: ['1', '2', '3', '4', '5', '6', 'full'] 
          }
        }
      }
    }
  };