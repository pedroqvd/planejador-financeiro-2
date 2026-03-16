import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { logAudit } from './audit';

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

                if (!isValid) {
                    await logAudit({
                        userId: user.id,
                        action: 'LOGIN_FAILURE',
                        details: 'Invalid password'
                    });
                    return null;
                }

                // Clear mfaVerifiedAt on every new login so MFA is required again
                if (user.mfaEnabled) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { mfaVerifiedAt: null },
                    });
                }

                await logAudit({
                    userId: user.id,
                    action: 'LOGIN_SUCCESS',
                    details: 'User logged in via credentials'
                });

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    plan: user.plan,
                    preferredCurrency: user.preferredCurrency || 'BRL',
                    mfaEnabled: user.mfaEnabled || false,
                    mfaVerified: !user.mfaEnabled, // true if no MFA, false if MFA enabled
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
                token.id = user.id!;
                token.plan = user.plan || 'free';
                token.preferredCurrency = user.preferredCurrency || 'BRL';
                token.mfaEnabled = user.mfaEnabled || false;
                token.mfaVerified = user.mfaVerified ?? true;
                token.issuedAt = Date.now();
            }

            // Invalidate session if password was changed after token was issued
            if (token.id && token.issuedAt) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { passwordChangedAt: true },
                    });
                    if (dbUser?.passwordChangedAt && new Date(dbUser.passwordChangedAt).getTime() > (token.issuedAt as number)) {
                        return { ...token, invalidated: true };
                    }
                } catch {
                    // Column may not exist yet if migration is pending — skip check
                }
            }

            // Refresh from DB on session update (triggered after MFA verification or settings change)
            if (trigger === 'update' && token.id) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { plan: true, preferredCurrency: true, mfaEnabled: true, mfaVerifiedAt: true },
                    });
                    if (dbUser) {
                        token.plan = dbUser.plan;
                        token.preferredCurrency = dbUser.preferredCurrency || 'BRL';
                        token.mfaEnabled = dbUser.mfaEnabled || false;
                        if (dbUser.mfaEnabled && dbUser.mfaVerifiedAt) {
                            token.mfaVerified = true;
                        } else if (!dbUser.mfaEnabled) {
                            token.mfaVerified = true;
                        } else {
                            token.mfaVerified = false;
                        }
                    }
                } catch {
                    // DB query failed — keep existing token values
                }
            }
            return token;
        },
        async session({ session, token }) {
            // If token was invalidated (password changed), clear the session
            if (token.invalidated) {
                session.user = undefined as any;
                return session;
            }
            if (session.user) {
                session.user.id = token.id;
                session.user.plan = token.plan;
                session.user.preferredCurrency = token.preferredCurrency;
                session.user.mfaEnabled = token.mfaEnabled;
                session.user.mfaVerified = token.mfaVerified;
            }
            return session;
        },
    },
});
