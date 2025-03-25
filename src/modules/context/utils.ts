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