import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Metas e Sonhos',
    description: 'Trace objetivos financeiros de curto, médio e longo prazo e defina estratégias claras para alcançá-los com nosso painel de metas visuais.',
};

export default function GoalsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
