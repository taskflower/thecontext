// src/utils.ts
import { type ClassValue, clsx } from "clsx";
import { useLocation } from "react-router-dom";
import { twMerge } from "tailwind-merge";
// We'll implement our own ID generator without relying on uuid

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

export const useCurrentModule = (): string => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  if (pathParts[1] === 'admin' && pathParts[2]) {
    return pathParts[2];
  }
  return 'documents'; 
};

/**
 * Generates a unique ID
 * @returns A unique string ID
 */
export const generateId = (): string => {
  // Simple implementation that creates a timestamp-based ID with some randomness
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
};

export const sanitizeHtml = (html: string): string => {
  // Prosta sanityzacja - w rzeczywistej aplikacji użyj biblioteki!
  if (!html) return '';
  
  // Przykład bardzo podstawowej sanityzacji:
  // Usuń potencjalnie niebezpieczne tagi script, iframe, etc.
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // usuń atrybuty on* (onClick, onLoad, etc.)
    .replace(/javascript:/gi, ''); // usuń protokuł javascript:
};

export default sanitizeHtml;