// src/core/config/firebaseConfigSync.ts - ENHANCED with versioning
import { collection, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/provideDB/firebase/config';
import { configDB } from '@/provideDB';

interface ConfigEntry {
  id: string;
  data: any;
  version: number; // 🆕 Version tracking
  updatedAt: Date;
}

interface ConfigDocument {
  name: string;
  version: number; // 🆕 Global config version
  entries: ConfigEntry[];
  updatedAt: Date;
}

export class FirebaseConfigSync {
  /**
   * 🆕 Saves config with auto-incrementing version
   */
  static async saveConfig(configName: string): Promise<void> {
    try {
      // Get current version from Firebase
      const currentDoc = await this.getConfigDocument(configName);
      const newVersion = (currentDoc?.version || 0) + 1;
      
      // Get all entries for this config from IndexedDB
      const entries = await configDB.records
        .where('id')
        .startsWith(`${configName}:`)
        .toArray();

      if (entries.length === 0) {
        console.warn(`No entries found for config "${configName}"`);
        return;
      }

      // Create versioned entries
      const versionedEntries: ConfigEntry[] = entries.map(entry => ({
        id: entry.id,
        data: entry.data,
        version: newVersion,
        updatedAt: new Date()
      }));

      const configDocument: ConfigDocument = {
        name: configName,
        version: newVersion,
        entries: versionedEntries,
        updatedAt: new Date()
      };

      // Save to Firebase
      const configRef = doc(db, 'configs', configName);
      await setDoc(configRef, configDocument);
      
      // Update local versions
      for (const entry of versionedEntries) {
        await configDB.records.put({
          id: entry.id,
          data: entry.data,
          version: entry.version,
          updatedAt: entry.updatedAt
        });
      }
      
      console.log(`✅ Saved config "${configName}" v${newVersion} (${entries.length} entries)`);
    } catch (error) {
      console.error(`Failed to save config "${configName}":`, error);
      throw error;
    }
  }

  /**
   * Loads config and checks version differences
   */
  static async loadConfig(configName: string): Promise<{ updated: boolean; version: number }> {
    try {
      const configDoc = await this.getConfigDocument(configName);
      
      if (!configDoc) {
        return { updated: false, version: 0 };
      }

      console.log(`🔄 Loading config "${configName}" v${configDoc.version} from Firebase`);
      
      let updatedCount = 0;
      
      // Sync all entries
      for (const entry of configDoc.entries) {
        const existing = await configDB.records.get(entry.id);
        const localVersion = (existing as any)?.version || 0;
        
        if (entry.version > localVersion) {
          await configDB.records.put({
            id: entry.id,
            data: entry.data,
            version: entry.version,
            updatedAt: new Date(entry.updatedAt)
          });
          updatedCount++;
        }
      }
      
      console.log(`✅ Updated ${updatedCount}/${configDoc.entries.length} entries for "${configName}"`);
      
      return { 
        updated: updatedCount > 0, 
        version: configDoc.version 
      };
    } catch (error) {
      console.warn(`Failed to load config "${configName}" from Firebase:`, error);
      return { updated: false, version: 0 };
    }
  }

  /**
   * Gets config document from Firebase
   */
  private static async getConfigDocument(configName: string): Promise<ConfigDocument | null> {
    try {
      const configRef = doc(db, 'configs', configName);
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        return configSnap.data() as ConfigDocument;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to get config document "${configName}":`, error);
      return null;
    }
  }

  /**
   * Lists available configs with versions
   */
  static async listConfigs(): Promise<string[]> { // 🛡️ Return string[] for compatibility
    try {
      const configsRef = collection(db, 'configs');
      const querySnapshot = await getDocs(configsRef);
      
      return querySnapshot.docs
        .map(doc => {
          const data = doc.data() as ConfigDocument;
          return data.name;
        })
        .filter(name => name && typeof name === 'string'); // 🛡️ Filter valid names
    } catch (error) {
      console.warn('Failed to list configs from Firebase:', error);
      return [];
    }
  }

  /**
   * Lists configs with detailed info (separate method)
   */
  static async listConfigsDetailed(): Promise<Array<{ name: string; version: number; entriesCount: number }>> {
    try {
      const configsRef = collection(db, 'configs');
      const querySnapshot = await getDocs(configsRef);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as ConfigDocument;
        return {
          name: data.name || doc.id,
          version: data.version || 1,
          entriesCount: data.entries?.length || 0
        };
      });
    } catch (error) {
      console.warn('Failed to list configs from Firebase:', error);
      return [];
    }
  }

  /**
   * Deletes config from Firebase
   */
  static async deleteConfig(configName: string): Promise<void> {
    try {
      const configRef = doc(db, 'configs', configName);
      await setDoc(configRef, { 
        deleted: true, 
        deletedAt: new Date(),
        version: 0
      });
      
      console.log(`🗑️ Deleted config "${configName}" from Firebase`);
    } catch (error) {
      console.error(`Failed to delete config "${configName}":`, error);
      throw error;
    }
  }
}