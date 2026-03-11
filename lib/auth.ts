import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Senha', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user) return null;

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    plan: user.plan,
                    preferredCurrency: (user as any).preferredCurrency || 'BRL',
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.plan = (user as { plan?: string }).plan || 'free';
                token.preferredCurrency = (user as any).preferredCurrency || 'BRL';
            }
            // Refresh plan and currency from DB on session update
            if (trigger === 'update' && token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    // @ts-ignore
                    select: { plan: true, preferredCurrency: true },
                });
                if (dbUser) {
                    token.plan = dbUser.plan;
                    token.preferredCurrency = (dbUser as any).preferredCurrency || 'BRL';
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).plan = token.plan as string;
                (session.user as any).preferredCurrency = token.preferredCurrency as string;
            }
            return session;
        },
    },
});
