// src/ngn2/config/ConfigManager.ts

import { db } from "../database";

export type ConfigType = "app" | "workspace" | "scenario" | "schema";

export function getConfigType(path: string): ConfigType {
  if (path.includes("/app.json")) return "app";
  if (path.includes("/workspaces/")) return "workspace";
  if (path.includes("/scenarios/")) return "scenario";
  return "schema";
}

export class ConfigManager {
  private cache = new Map<string, any>();

  async loadConfig(path: string): Promise<any> {
    // Check cache first
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    try {
      // Try database first
      let data = await db.getConfig(path);

      // Fallback to fetch if not in DB
      if (!data) {
        const response = await fetch(path);
        if (response.ok) {
          data = await response.json();
          // Save to DB for future use (non-blocking)
          try {
            await db.saveConfig(path, data, getConfigType(path));
          } catch (e) {
            console.warn("Failed to cache config in DB:", e);
          }
        } else {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }
      }

      // Cache in memory
      if (data) {
        this.cache.set(path, data);
      }

      return data;
    } catch (error) {
      console.error(`Failed to load config: ${path}`, error);
      throw error;
    }
  }

  async saveConfig(path: string, config: any): Promise<void> {
    // Update cache
    this.cache.set(path, config);

    // Save to database
    await db.saveConfig(path, config, getConfigType(path));
  }

  async getAllConfigs(type?: ConfigType) {
    return await db.getAllConfigs(type);
  }

  clearCache(path?: string) {
    if (path) {
      this.cache.delete(path);
    } else {
      this.cache.clear();
    }
  }

  async exportConfigs(): Promise<Record<string, any>> {
    const configs = await db.getAllConfigs();
    return configs.reduce((acc, { path, config }) => {
      acc[path] = config;
      return acc;
    }, {} as Record<string, any>);
  }
}

// Singleton instance
export const configManager = new ConfigManager();
