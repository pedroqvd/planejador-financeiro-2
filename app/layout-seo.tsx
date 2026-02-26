import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | Visão Geral',
    description: 'Acompanhe suas receitas, despesas, e alcance suas metas financeiras com acompanhamento mensal.',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
