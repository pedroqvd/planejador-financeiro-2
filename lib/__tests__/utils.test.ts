import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn (class merge utility)', () => {
    it('should merge class names', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
        expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
    });

    it('should merge conflicting Tailwind classes', () => {
        // twMerge should keep the last conflicting class
        expect(cn('px-4', 'px-6')).toBe('px-6');
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should handle empty input', () => {
        expect(cn()).toBe('');
    });

    it('should handle undefined and null values', () => {
        expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });

    it('should handle array inputs', () => {
        expect(cn(['foo', 'bar'])).toBe('foo bar');
    });
});
