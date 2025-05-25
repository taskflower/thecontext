/// src/db.ts
import Dexie from "dexie";

export interface Record<T> { id?: string; data: T; updatedAt: Date }
export class DB<T> extends Dexie {
  public records: Dexie.Table<Record<T>, string>;
  constructor(name: string) {
    super(name);
    this.version(1).stores({ records: "&id, updatedAt" });
    this.records = this.table("records");
  }
}
export const configDB = new DB<any>("config");