import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'WealthCash — Planejamento Financeiro Inteligente',
  description: 'Plataforma completa para gestão e planejamento financeiro pessoal com consultoria IA.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="font-sans bg-zinc-50 text-zinc-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
