// src/ngn2/database/index.ts
import Dexie, { Table } from "dexie";

export interface ConfigRecord {
  id?: number;
  path: string;
  config: any;
  type: "app" | "workspace" | "scenario" | "schema";
  lastModified: Date;
  isUserGenerated?: boolean;
}

export interface DataRecord {
  id?: number;
  collection: string;
  itemId: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMExperiment {
  id?: number;
  name: string;
  prompt: string;
  systemMessage?: string;
  targetConfigPath: string;
  result?: any;
  status: "pending" | "running" | "completed" | "error";
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export class AppDatabase extends Dexie {
  configs!: Table<ConfigRecord>;
  data!: Table<DataRecord>;
  experiments!: Table<LLMExperiment>;

  constructor() {
    super("UniversalEngineDB");

    this.version(1).stores({
      configs: "++id, path, type, lastModified, isUserGenerated",
      data: "++id, collection, itemId, createdAt, updatedAt",
      experiments: "++id, name, targetConfigPath, status, createdAt",
    });
  }

  // Config management
  async saveConfig(path: string, config: any, type: ConfigRecord["type"]) {
    try {
      return await this.configs.put({
        path,
        config,
        type,
        lastModified: new Date(),
        isUserGenerated: true,
      });
    } catch (error) {
      console.error("Failed to save config:", error);
      throw error;
    }
  }

  async getConfig(path: string): Promise<any> {
    try {
      const record = await this.configs.where("path").equals(path).first();
      return record?.config;
    } catch (error) {
      console.error("Failed to get config:", error);
      return null;
    }
  }

  async getAllConfigs(type?: ConfigRecord["type"]) {
    try {
      const query = type
        ? this.configs.where("type").equals(type)
        : this.configs.toArray();
      return await query;
    } catch (error) {
      console.error("Failed to get all configs:", error);
      return [];
    }
  }

  // Data management (CRUD)
  async saveData(collection: string, itemId: string, data: any) {
    try {
      const existing = await this.data
        .where("collection")
        .equals(collection)
        .and((item) => item.itemId === itemId)
        .first();

      if (existing) {
        return await this.data.update(existing.id!, {
          data,
          updatedAt: new Date(),
        });
      } else {
        return await this.data.add({
          collection,
          itemId,
          data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Failed to save data:", error);
      throw error;
    }
  }

  async getData(collection: string, itemId?: string) {
    try {
      if (itemId) {
        const record = await this.data
          .where("collection")
          .equals(collection)
          .and((item) => item.itemId === itemId)
          .first();
        return record?.data;
      } else {
        const records = await this.data
          .where("collection")
          .equals(collection)
          .toArray();
        return records.map((r) => r.data);
      }
    } catch (error) {
      console.error("Failed to get data:", error);
      return itemId ? null : [];
    }
  }

  async deleteData(collection: string, itemId: string) {
    try {
      return await this.data
        .where("collection")
        .equals(collection)
        .and((item) => item.itemId === itemId)
        .delete();
    } catch (error) {
      console.error("Failed to delete data:", error);
      throw error;
    }
  }

  // LLM Experiments
  async saveExperiment(experiment: Omit<LLMExperiment, "id" | "createdAt">) {
    try {
      return await this.experiments.add({
        ...experiment,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to save experiment:", error);
      throw error;
    }
  }

  async updateExperiment(id: number, updates: Partial<LLMExperiment>) {
    try {
      return await this.experiments.update(id, {
        ...updates,
        ...(updates.status === "completed" ? { completedAt: new Date() } : {}),
      });
    } catch (error) {
      console.error("Failed to update experiment:", error);
      throw error;
    }
  }

  async getExperiments() {
    try {
      return await this.experiments.orderBy("createdAt").reverse().toArray();
    } catch (error) {
      console.error("Failed to get experiments:", error);
      return [];
    }
  }

  async deleteExperiment(id: number) {
    try {
      return await this.experiments.delete(id);
    } catch (error) {
      console.error("Failed to delete experiment:", error);
      throw error;
    }
  }

  // Utility methods
  async clearAll() {
    try {
      await Promise.all([
        this.configs.clear(),
        this.data.clear(),
        this.experiments.clear(),
      ]);
    } catch (error) {
      console.error("Failed to clear database:", error);
      throw error;
    }
  }

  async exportData() {
    try {
      const [configs, data, experiments] = await Promise.all([
        this.configs.toArray(),
        this.data.toArray(),
        this.experiments.toArray(),
      ]);

      return {
        configs,
        data,
        experiments,
        exportedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to export data:", error);
      throw error;
    }
  }

  async importData(exportedData: any) {
    try {
      await this.clearAll();

      if (exportedData.configs) {
        await this.configs.bulkAdd(exportedData.configs);
      }
      if (exportedData.data) {
        await this.data.bulkAdd(exportedData.data);
      }
      if (exportedData.experiments) {
        await this.experiments.bulkAdd(exportedData.experiments);
      }
    } catch (error) {
      console.error("Failed to import data:", error);
      throw error;
    }
  }
}

// Singleton instance
export const db = new AppDatabase();

// Error handling for database initialization
db.open().catch((error) => {
  console.error("Failed to open database:", error);
});

// Export types for external use
export type { ConfigRecord, DataRecord, LLMExperiment };
