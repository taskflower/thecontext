// src/db.ts - Simple IndexedDB configuration
import Dexie, { Table } from 'dexie';

export interface ConfigRecord {
  id: string;
  data: any;
  updatedAt: Date;
}

export class ConfigDatabase extends Dexie {
  records!: Table<ConfigRecord>;

  constructor() {
    super('ConfigDatabase');
    this.version(1).stores({
      records: 'id, updatedAt'
    });
  }
}

export const configDB = new ConfigDatabase();