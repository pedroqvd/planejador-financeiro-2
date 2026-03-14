import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
            plan: string;
            preferredCurrency: string;
            mfaEnabled: boolean;
            mfaVerified: boolean;
        };
    }

    interface User {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        plan: string;
        preferredCurrency: string;
        mfaEnabled: boolean;
        mfaVerified: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        plan: string;
        preferredCurrency: string;
        mfaEnabled: boolean;
        mfaVerified: boolean;
        issuedAt: number;
        invalidated?: boolean;
    }
}
