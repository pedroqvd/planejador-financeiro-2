import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize user input by removing dangerous characters (XSS prevention).
 * Centralized to avoid duplication across API routes.
 */
export function sanitize(str: string, maxLength = 200): string {
  return str.replace(/[<>&"'/\\]/g, '').trim().slice(0, maxLength);
}
