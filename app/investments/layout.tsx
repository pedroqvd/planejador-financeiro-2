import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Investimentos',
    description: 'Desubra qual o seu perfil de investidor e acompanhe métricas de mercado: IPCA, CDI e rentabilidade em diferentes cenários de risco.',
};

export default function InvestmentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
