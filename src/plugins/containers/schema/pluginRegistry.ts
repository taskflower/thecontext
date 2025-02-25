// src/plugins/schema/pluginRegistry.ts
import { SchemaPlugin } from './types';
import { noteSchema, taskSchema, contactSchema } from './basicSchemas';

class SchemaPluginRegistry {
  private plugins: Map<string, SchemaPlugin> = new Map();

  constructor() {
    // Register basic schemas
    this.registerPlugin(noteSchema);
    this.registerPlugin(taskSchema);
    this.registerPlugin(contactSchema);
  }

  registerPlugin(plugin: SchemaPlugin) {
    this.plugins.set(plugin.id, plugin);
  }

  getPlugin(id: string): SchemaPlugin | undefined {
    return this.plugins.get(id);
  }

  getAllPlugins(): SchemaPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const schemaRegistry = new SchemaPluginRegistry();
