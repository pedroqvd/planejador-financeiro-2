export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/recurrences/detect
 * Scans the user's transaction history for the last 3 months
 * and detects recurring patterns (same name + similar amount across 2+ months).
 * Returns a list of suggested recurrences the user can confirm.
 */
export async function POST() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

        // Fetch all transactions in the last 3 months
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                date: { gte: threeMonthsAgo },
            },
            select: { name: true, amount: true, type: true, category: true, date: true },
            orderBy: { date: 'asc' },
        });

        // Group by normalized name
        const groups: Record<string, { name: string; amounts: number[]; type: string; category: string; dates: Date[] }> = {};

        for (const tx of transactions) {
            const key = tx.name.toLowerCase().trim().replace(/\s+/g, ' ');
            if (!groups[key]) {
                groups[key] = { name: tx.name, amounts: [], type: tx.type, category: tx.category, dates: [] };
            }
            groups[key].amounts.push(tx.amount);
            groups[key].dates.push(new Date(tx.date));
        }

        // Fetch existing recurrences to avoid duplicates
        const existingRecurrences = await prisma.recurrence.findMany({
            where: { userId: session.user.id },
            select: { name: true },
        });
        const existingNames = new Set(existingRecurrences.map(r => r.name.toLowerCase().trim()));

        // Detect patterns: same name appearing in 2+ distinct months with similar amounts
        const suggestions: {
            name: string;
            category: string;
            amount: number;
            type: string;
            frequency: string;
            confidence: number;
        }[] = [];

        for (const [key, group] of Object.entries(groups)) {
            // Skip if already a recurrence
            if (existingNames.has(key)) continue;

            // Get distinct months
            const distinctMonths = new Set(group.dates.map(d => `${d.getFullYear()}-${d.getMonth()}`));
            if (distinctMonths.size < 2) continue;

            // Check amount consistency (within 20% tolerance)
            const avgAmount = group.amounts.reduce((s, a) => s + a, 0) / group.amounts.length;
            const consistent = group.amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.2);
            if (!consistent) continue;

            // Determine frequency
            const monthCount = distinctMonths.size;
            let frequency = 'monthly';
            if (group.dates.length > monthCount * 3) frequency = 'weekly';

            // Confidence: more months = higher confidence
            const confidence = Math.min(Math.round((monthCount / 3) * 100), 100);

            suggestions.push({
                name: group.name,
                category: group.category,
                amount: Math.round(avgAmount * 100) / 100,
                type: group.type,
                frequency,
                confidence,
            });
        }

        // Sort by confidence desc, then by amount desc
        suggestions.sort((a, b) => b.confidence - a.confidence || b.amount - a.amount);

        return NextResponse.json({ suggestions: suggestions.slice(0, 20) });
    } catch (error) {
        console.error('Error detecting recurrences:', error);
        return NextResponse.json({ error: 'Erro ao detectar recorrências' }, { status: 500 });
    }
}
