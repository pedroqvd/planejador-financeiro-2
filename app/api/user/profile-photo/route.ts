import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb',
        },
    },
};

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'Imagem não fornecida' }, { status: 400 });
        }

        // Validate base64 image (basic check)
        if (!image.startsWith('data:image/')) {
            return NextResponse.json({ error: 'Formato de imagem inválido' }, { status: 400 });
        }

        await prisma.user.update({
            where: { email: session.user.email },
            data: { image },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating profile photo:', error);
        return NextResponse.json({ error: 'Erro ao atualizar foto de perfil' }, { status: 500 });
    }
}
