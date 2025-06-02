// ========================================
// src/modules/edv2/shared/editorUtils.ts
// ========================================
export const parsePath = (pathname: string) => {
    const parts = pathname.split('/').filter(Boolean);
    return {
      config: parts[0] || 'exampleTicketApp',
      workspace: parts[1] || 'main',
      scenario: parts[2],
      step: parts[3],
      id: parts[4]
    };
  };
  
  export const createDefaultNode = (slug: string, order: number) => ({
    slug,
    label: slug.charAt(0).toUpperCase() + slug.slice(1),
    tplFile: 'ListTemplate',
    order,
    description: '',
    validations: [],
    handlers: {}
  });
  
  export const createDefaultWidget = (type: string) => {
    const attrs = type === 'ButtonWidget' 
      ? { navigationPath: '', variant: 'default', colSpan: '2' }
      : type === 'InfoWidget'
      ? { content: 'Content here', variant: 'default', colSpan: '3' }
      : { size: 'medium', colSpan: 'full' };
  
    return {
      tplFile: type,
      title: `New ${type.replace('Widget', '')}`,
      attrs
    };
  };
  
  export const createDefaultSchema = (name: string) => ({
    [name]: {
      type: 'object',
      properties: {
        name: { type: 'string', label: 'Name', fieldType: 'text', required: true }
      }
    }
  });
  