export type OfflineTransaction = {
    tempId: string;
    action: 'POST' | 'PUT' | 'DELETE';
    data: any;
    timestamp: number;
};

const QUEUE_KEY = 'wc_sync_queue';

export function getSyncQueue(): OfflineTransaction[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(QUEUE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function addToSyncQueue(action: 'POST' | 'PUT' | 'DELETE', data: any) {
    if (typeof window === 'undefined') return;
    const queue = getSyncQueue();
    const newItem: OfflineTransaction = {
        tempId: crypto.randomUUID(),
        action,
        data,
        timestamp: Date.now()
    };
    localStorage.setItem(QUEUE_KEY, JSON.stringify([...queue, newItem]));
}

export function clearFromQueue(tempId: string) {
    if (typeof window === 'undefined') return;
    const queue = getSyncQueue();
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.filter(item => item.tempId !== tempId)));
}

export async function processSyncQueue(onSuccess?: () => void) {
    if (typeof window === 'undefined' || !navigator.onLine) return;

    const queue = getSyncQueue();
    if (queue.length === 0) return;

    for (const item of queue) {
        try {
            const res = await fetch('/api/transactions', {
                method: item.action,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data),
            });

            if (res.ok) {
                clearFromQueue(item.tempId);
            }
        } catch (error) {
            console.error('Failed to sync item:', item.tempId, error);
            // Stop processing if we hit a network error again
            break;
        }
    }

    if (onSuccess) onSuccess();
}
