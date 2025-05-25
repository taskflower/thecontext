/// src/db.ts
import Dexie from "dexie";

export interface Record<T> { id?: string; data: T; updatedAt: Date }
export class DB<T> extends Dexie {
  table: Dexie.Table<Record<T>, string>;
  constructor(name: string) {
    super(name);
    this.version(1).stores({ table: "&id, updatedAt" });
    this.table = this.table("table");
  }
}
export const configDB = new DB<any>("config");
