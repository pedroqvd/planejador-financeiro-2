'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Share2, Users, Check, Copy } from 'lucide-react';

export function ReferralManager() {
    const { data: session } = useSession();
    const [referralCode, setReferralCode] = useState<string>('');
    const [referralsCount, setReferralsCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchReferralData = async () => {
            try {
                const res = await fetch('/api/dashboard');
                if (res.ok) {
                    const data = await res.json();
                    if (data.referral) {
                        setReferralCode(data.referral.referralCode);
                        setReferralsCount(data.referral.referralsCount);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch referral data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchReferralData();
        }
    }, [session]);

    const handleCopy = async () => {
        if (!typeof window) return;
        const link = `${window.location.origin}/register?ref=${referralCode}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6 border border-zinc-200 bg-zinc-50 animate-pulse">
                <div className="h-4 w-32 bg-zinc-200"></div>
            </div>
        );
    }

    if (!referralCode) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-zinc-900">Programa de Indicações</h3>
                    <p className="text-xs text-zinc-500 mt-1">Convide amigos e ganhe recompensas limitadas</p>
                </div>
            </div>

            <div className="p-4 border border-zinc-200 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-zinc-900">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider">Metas de Convite</span>
                    </div>
                    <span className="text-xs font-medium text-zinc-500">{referralsCount} / 3 concluídos</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-zinc-900 transition-all duration-500"
                        style={{ width: `${Math.min((referralsCount / 3) * 100, 100)}%` }}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${referralCode}`}
                            className="w-full pl-4 pr-12 py-2.5 bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 truncate focus:outline-none"
                        />
                        <button
                            onClick={handleCopy}
                            className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="px-4 py-2.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 hover:bg-zinc-800 transition-colors shrink-0"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Compartilhar Link</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
