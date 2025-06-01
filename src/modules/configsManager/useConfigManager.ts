// src/core/hooks/useConfigManager.ts
import { useState, useCallback } from 'react';
import { configDB } from '@/provideDB';
import { FirebaseConfigSync } from '@/provideDB/firebase/firebaseConfigSync';

interface ConfigInfo {
  name: string;
  entriesCount: number;
  lastModified: Date;
  source: 'local' | 'firebase' | 'both';
}

export function useConfigManager() {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<ConfigInfo[]>([]);

  /**
   * Ładuje listę wszystkich konfiguracji (lokalne + Firebase)
   */
  const loadConfigList = useCallback(async () => {
    setLoading(true);
    try {
      // Pobierz lokalne konfiguracje
      const localEntries = await configDB.records.toArray();
      const localConfigs = new Map<string, { count: number; lastModified: Date }>();
      
      localEntries.forEach(entry => {
        if (!entry.id || typeof entry.id !== 'string') return; // 🛡️ Skip invalid entries
        
        const configName = entry.id.split(':')[0];
        if (!configName) return; // 🛡️ Skip if no config name
        
        if (!localConfigs.has(configName)) {
          localConfigs.set(configName, { count: 0, lastModified: entry.updatedAt });
        }
        const config = localConfigs.get(configName)!;
        config.count++;
        if (entry.updatedAt > config.lastModified) {
          config.lastModified = entry.updatedAt;
        }
      });

      // Pobierz Firebase konfiguracje
      const firebaseConfigs = await FirebaseConfigSync.listConfigs();
      console.log('📊 Firebase configs loaded:', firebaseConfigs); // 🔍 Debug log
      
      // Połącz informacje
      const allConfigNames = new Set([
        ...localConfigs.keys(),
        ...firebaseConfigs
      ]);

      const configList: ConfigInfo[] = Array.from(allConfigNames)
        .filter(name => name && typeof name === 'string') // 🛡️ Filter out invalid names
        .map(name => {
          const local = localConfigs.get(name);
          const inFirebase = firebaseConfigs.includes(name);
          
          return {
            name: String(name), // 🛡️ Ensure string
            entriesCount: local?.count || 0,
            lastModified: local?.lastModified || new Date(),
            source: local && inFirebase ? 'both' : local ? 'local' : 'firebase'
          };
        });

      setConfigs(configList.sort((a, b) => a.name.localeCompare(b.name)));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ładuje konfigurację z Firebase do IndexedDB
   */
  const downloadConfig = useCallback(async (configName: string) => {
    setLoading(true);
    try {
      await FirebaseConfigSync.loadConfig(configName);
      await loadConfigList(); // Odśwież listę
    } finally {
      setLoading(false);
    }
  }, [loadConfigList]);

  /**
   * Zapisuje konfigurację z IndexedDB do Firebase
   */
  const uploadConfig = useCallback(async (configName: string) => {
    setLoading(true);
    try {
      await FirebaseConfigSync.saveConfig(configName);
      await loadConfigList(); // Odśwież listę
    } finally {
      setLoading(false);
    }
  }, [loadConfigList]);

  /**
   * Usuwa konfigurację z Firebase
   */
  const deleteConfig = useCallback(async (configName: string) => {
    setLoading(true);
    try {
      await FirebaseConfigSync.deleteConfig(configName);
      await loadConfigList(); // Odśwież listę
    } finally {
      setLoading(false);
    }
  }, [loadConfigList]);

  /**
   * Czyści lokalną konfigurację (IndexedDB)
   */
  const clearLocalConfig = useCallback(async (configName: string) => {
    setLoading(true);
    try {
      await configDB.records
        .where('id')
        .startsWith(`${configName}:`)
        .delete();
      
      await loadConfigList(); // Odśwież listę
    } finally {
      setLoading(false);
    }
  }, [loadConfigList]);

  return {
    configs,
    loading,
    loadConfigList,
    downloadConfig,
    uploadConfig,
    deleteConfig,
    clearLocalConfig
  };
}