// src/utils.ts
import { type ClassValue, clsx } from "clsx";
import { useLocation } from "react-router-dom";
import { twMerge } from "tailwind-merge";

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