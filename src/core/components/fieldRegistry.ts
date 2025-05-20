// src/core/components/fieldRegistry.ts
import { useConfig } from '@/ConfigProvider';

// Wczytujemy wszystkie rejestry motywów przy budowaniu
const registryModules = import.meta.globEager('../../themes/*/fieldRegistry.ts');

/**
 * Pobiera scalony rejestr komponentów dla aktywnego motywu
 */
export function getFieldRegistry(): Record<string, React.ComponentType<any>> {
    const theme = useConfig().config?.tplDir || 'default';
    // Klucz w import.meta.globEager zależy od ścieżki względem tego pliku
    const defaultKey = '../../themes/default/fieldRegistry.ts';
    const themeKey = `../../themes/${theme}/fieldRegistry.ts`;
    const defaultRegistry = (registryModules[defaultKey] as any).default;
    const themeRegistry = (registryModules[themeKey] as any)?.default || {};
    return { ...defaultRegistry, ...themeRegistry };
  }