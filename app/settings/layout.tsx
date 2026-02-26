import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Configurações do Perfil',
    description: 'Gerencie sua conta, avatar, configurações de segurança e assinatura do plano WealthCash Pro e Premium.',
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
