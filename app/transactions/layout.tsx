import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Transações | Histórico',
    description: 'Visualize, filtre e exporte todo o seu histórico de transações financeiras. Adicione, edite ou exclua registros com facilidade.',
};

export default function TransactionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
