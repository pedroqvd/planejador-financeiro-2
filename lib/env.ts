// Environment validation — runs at startup
// Import this in layout.tsx or middleware to validate early

const requiredVars = ['DATABASE_URL', 'AUTH_SECRET'] as const;

const optionalVars = [
    { key: 'STRIPE_SECRET_KEY', label: 'Stripe (pagamentos)' },
    { key: 'STRIPE_WEBHOOK_SECRET', label: 'Stripe Webhooks' },
    { key: 'GEMINI_API_KEY', label: 'Gemini IA Advisor' },
    { key: 'UPSTASH_REDIS_REST_URL', label: 'Upstash Rate Limiting' },
] as const;

export function validateEnv() {
    const missing: string[] = [];

    for (const key of requiredVars) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `❌ Variáveis de ambiente obrigatórias não configuradas:\n` +
            missing.map(k => `   - ${k}`).join('\n') +
            `\n\nConfigure no arquivo .env e reinicie o servidor.`
        );
    }

    // Warn about optional vars (don't throw)
    if (process.env.NODE_ENV === 'development') {
        const warnings: string[] = [];
        for (const { key, label } of optionalVars) {
            if (!process.env[key]) {
                warnings.push(`   ⚠️ ${key} — ${label} desabilitado`);
            }
        }
        if (warnings.length > 0) {
            console.warn(`\n🔧 Variáveis opcionais não configuradas:\n${warnings.join('\n')}\n`);
        }
    }
}

// Auto-validate on import (server-side only)
if (typeof window === 'undefined') {
    validateEnv();
}
