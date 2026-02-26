/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        include: ['**/__tests__/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['lib/**', 'components/**', 'app/api/**'],
            exclude: ['**/__tests__/**', 'node_modules/**'],
        },
    },
});
