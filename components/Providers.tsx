'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { NavigationProgress } from '@/components/NavigationProgress';
import { OnboardingProvider } from '@/components/Onboarding';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider>
                <ToastProvider>
                    <OnboardingProvider>
                        <NavigationProgress />
                        {children}
                    </OnboardingProvider>
                </ToastProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
