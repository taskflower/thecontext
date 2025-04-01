/**
 * Widget registry - central place for registering widget components
 */
import { WidgetComponentProps, WidgetRegistry } from './types';

/**
 * Widget registry - holds all available widget types
 */
const registry: WidgetRegistry = {};

/**
 * Register a widget type
 */
export function registerWidget(
  key: string, 
  component: React.ComponentType<WidgetComponentProps>, 
  options: {
    name: string;
    description?: string;
    category?: string;
    defaultHeight?: number;
    defaultConfig?: Record<string, unknown>;
  }
) {
  if (registry[key]) {
    console.warn(`Widget type "${key}" already registered. Overwriting.`);
  }
  
  registry[key] = {
    component,
    name: options.name,
    description: options.description,
    category: options.category || 'General',
    defaultHeight: options.defaultHeight || 300,
    defaultConfig: options.defaultConfig || {},
  };
  
  console.log(`Widget type "${key}" registered`);
}

/**
 * Get all available widget types
 */
export function getWidgetTypes(): string[] {
  return Object.keys(registry);
}

/**
 * Get widget by type
 */
export function getWidget(type: string) {
  return registry[type];
}

/**
 * Get all widgets
 */
export function getAllWidgets() {
  return Object.entries(registry).map(([key, data]) => ({
    type: key,
    ...data,
  }));
}

/**
 * Get widgets by category
 */
export function getWidgetsByCategory(category: string) {
  return Object.entries(registry)
    .filter(([, data]) => data.category === category)
    .map(([key, data]) => ({
      type: key,
      ...data,
    }));
}

/**
 * Group widgets by category
 */
export function getWidgetsByCategories() {
  const categories: Record<string, Array<{type: string, component: React.ComponentType<WidgetComponentProps>, name: string, description?: string, category?: string, defaultHeight?: number, defaultConfig?: Record<string, unknown>}>> = {};
  
  Object.entries(registry).forEach(([key, data]) => {
    const category = data.category || 'General';
    
    if (!categories[category]) {
      categories[category] = [];
    }
    
    categories[category].push({
      type: key,
      ...data,
    });
  });
  
  return categories;
}

export default registry;