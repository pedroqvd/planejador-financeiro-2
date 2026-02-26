import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import '@/lib/env'; // Validate environment on startup

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: {
    default: 'WealthCash — Planejamento Financeiro Inteligente',
    template: '%s | WealthCash',
  },
  description: 'Planejamento financeiro com IA que analisa seus gastos, sugere economias e te ajuda a alcançar suas metas. Dashboard premium para brasileiros.',
  keywords: ['planejamento financeiro', 'controle financeiro', 'IA financeira', 'orçamento pessoal', 'finanças pessoais', 'WealthCash'],
  authors: [{ name: 'WealthCash' }],
  creator: 'WealthCash',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'WealthCash',
    title: 'WealthCash — Planejamento Financeiro Inteligente',
    description: 'Planejamento financeiro com IA. Dashboard premium para brasileiros.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WealthCash — Planejamento Financeiro Inteligente',
    description: 'Planejamento financeiro com IA para brasileiros.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans text-zinc-900 antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
