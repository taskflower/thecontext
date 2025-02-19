/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/documentFields.ts

// Funkcja zwraca klucz dokładnie taki, jaki został przekazany – bez dodatkowego prefiksu.
export const getFieldKey = (fieldName: string): string => fieldName;

// Jeśli już nie będziemy dodawać prefiksu, funkcja ta nie jest potrzebna,
// ale zachowujemy ją dla kompatybilności.
export const isCustomField = (_key: string): boolean => {
    void _key;
    return false;
  };

// Funkcja do wyciągania custom fields – zakładamy, że są zapisane w obiekcie customFields
export const extractCustomFields = (document: any): Record<string, unknown> => {
  return document.customFields || {};
};

// Funkcja flattenCustomFields – teraz zwraca pola bez modyfikacji kluczy.
export const flattenCustomFields = (
  fields: Record<string, unknown>
): Record<string, unknown> => {
  return { ...fields };
};
