// src/services/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? text.slice(0, maxLength) + "..." : text;