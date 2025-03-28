/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/context/utils.ts
import { ContextItem } from "./types";

/**
 * Bazowa funkcja przetwarzająca szablony - można jej używać zarówno w komponentach React,
 * jak i poza nimi (np. w akcjach store)
 * 
 * @param template Tekst z tokenami {{nazwa}} do zastąpienia
 * @param contextItems Lista elementów kontekstowych
 * @returns Tekst z podstawionymi wartościami
 */
export const processTemplateWithItems = (
  template: string,
  contextItems: ContextItem[]
): string => {
  if (!template) return '';
  
  let result = template;
  
  contextItems.forEach(item => {
    const tokenPattern = new RegExp(`{{${item.title}}}`, 'g');
    result = result.replace(tokenPattern, item.content || '');
  });
  
  return result;
};

/**
 * Determines if a string contains valid JSON
 * 
 * @param str The string to check
 * @returns An object with type ('json' or 'text') and the parsed value if JSON
 */
export const detectContentType = (
  str: string
): { type: 'json' | 'text'; value: any } => {
  if (!str || typeof str !== 'string') {
    return { type: 'text', value: str };
  }

  // Trim the string to handle whitespace
  const trimmed = str.trim();
  
  // Check if it starts with typical JSON identifiers
  const startsWithJsonIdentifier = 
    (trimmed.startsWith('{') && trimmed.endsWith('}')) || 
    (trimmed.startsWith('[') && trimmed.endsWith(']'));

  if (startsWithJsonIdentifier) {
    try {
      const parsed = JSON.parse(trimmed);
      return { type: 'json', value: parsed };
    } catch  {
      // If parsing fails, it's not valid JSON
      return { type: 'text', value: str };
    }
  }

  return { type: 'text', value: str };
};