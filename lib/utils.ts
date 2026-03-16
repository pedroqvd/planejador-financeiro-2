import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize user input by removing dangerous characters and HTML entities (XSS prevention).
 * Centralized to avoid duplication across API routes.
 */
export function sanitize(str: string, maxLength = 200): string {
  return str
    .replace(/&#?\w+;/g, '')        // Remove HTML entities (&#60;, &lt;, &#x3C;, etc.)
    .replace(/[<>&"'/\\]/g, '')     // Remove raw dangerous characters
    .replace(/javascript:/gi, '')   // Remove javascript: protocol
    .replace(/data:/gi, '')         // Remove data: protocol
    .trim()
    .slice(0, maxLength);
}
