import { prisma } from './prisma';
import { headers } from 'next/headers';

export async function logAudit({
    userId,
    action,
    details,
}: {
    userId?: string;
    action: string;
    details?: string;
}) {
    try {
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';
        const userAgent = headerList.get('user-agent') || 'unknown';

        await prisma.auditLog.create({
            data: {
                userId,
                action,
                details,
                ip,
                userAgent,
            },
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // We don't want to throw error if logging fails (to not break the main flow)
        // in production, you might want to send this to an external logging service
    }
}
