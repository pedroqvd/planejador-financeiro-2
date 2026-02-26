'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="pt-BR">
            <body style={{
                margin: 0,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, system-ui, sans-serif',
                background: 'linear-gradient(135deg, #f8fafc, #fef2f2)',
                color: '#18181b',
            }}>
                <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: 20,
                        background: 'linear-gradient(135deg, #fee2e2, #fef3c7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        fontSize: 36,
                    }}>
                        ⚠️
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>
                        Erro Crítico
                    </h1>
                    <p style={{ fontSize: 14, color: '#71717a', lineHeight: 1.6, margin: '0 0 24px' }}>
                        O aplicativo encontrou um erro fatal. Tente recarregar a página.
                    </p>
                    {error.digest && (
                        <p style={{
                            fontSize: 12,
                            color: '#a1a1aa',
                            fontFamily: 'monospace',
                            background: '#f4f4f5',
                            borderRadius: 8,
                            padding: '6px 12px',
                            display: 'inline-block',
                            marginBottom: 24,
                        }}>
                            Código: {error.digest}
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={reset}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 12,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            🔄 Recarregar
                        </button>
                        <a
                            href="/"
                            style={{
                                padding: '12px 24px',
                                background: 'white',
                                color: '#3f3f46',
                                border: '1px solid #e4e4e7',
                                borderRadius: 12,
                                fontSize: 14,
                                fontWeight: 500,
                                textDecoration: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            🏠 Dashboard
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
