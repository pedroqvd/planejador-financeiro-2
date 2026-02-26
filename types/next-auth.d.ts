import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            plan: string;
        };
    }

    interface User {
        plan?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        plan: string;
    }
}
