/**
 * Production-safe logger that avoids leaking sensitive data.
 * In production, only logs the message prefix without error details.
 * In development, logs full error objects for debugging.
 */

const isProd = process.env.NODE_ENV === 'production';

export const logger = {
    error(message: string, error?: unknown) {
        if (isProd) {
            console.error(message);
        } else {
            console.error(message, error);
        }
    },
    warn(message: string, detail?: unknown) {
        if (isProd) {
            console.warn(message);
        } else {
            console.warn(message, detail);
        }
    },
    info(message: string, detail?: unknown) {
        if (isProd) {
            // Suppress info logs in production to reduce noise
            return;
        }
        console.log(message, detail);
    },
};
