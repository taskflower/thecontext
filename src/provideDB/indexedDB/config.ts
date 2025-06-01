// src/provideDB/indexedDB/config.ts - ENHANCED with versioning
import Dexie, { Table } from 'dexie';

export interface ConfigRecord {
  id: string;
  data: any;
  version?: number; // 🆕 Version tracking
  updatedAt: Date;
}

export class ConfigDatabase extends Dexie {
  records!: Table<ConfigRecord>;

  constructor() {
    super('ConfigDatabase');
    
    // 🆕 Version 2 with version field
    this.version(2).stores({
      records: 'id, version, updatedAt'
    }).upgrade(tx => {
      // Add version field to existing records
      return tx.table('records').toCollection().modify(record => {
        if (!record.version) {
          record.version = 1;
        }
      });
    });
    
    // Legacy version 1
    this.version(1).stores({
      records: 'id, updatedAt'
    });
  }
}

export const configDB = new ConfigDatabase();