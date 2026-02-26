import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Orçamento Inteligente',
    description: 'Defina limites de gastos por categoria, acompanhe a evolução no mês e receba notificações proativas para manter suas finanças sob controle.',
};

export default function BudgetLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
