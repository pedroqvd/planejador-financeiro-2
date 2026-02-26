import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Consultor Financeiro AI',
    description: 'Converse com o Cash, seu consultor inteligente. Receba análises de gastos e dicas personalizadas de economia baseadas no seu perfil e metas.',
};

export default function AILayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
