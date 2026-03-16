'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/lib/currency';
import {
  ShoppingCart,
  Car,
  Home,
  Coffee,
  Briefcase,
  Wallet,
  CreditCard,
  Utensils,
  Heart,
  Gamepad2,
  GraduationCap,
  Plane,
} from 'lucide-react';

type Transaction = {
  category: string;
  amount: number;
  type: string;
};

const categoryConfig: Record<string, { icon: any; color: string }> = {
  'Alimentação': { icon: Utensils, color: '#f59e0b' },
  'Transporte': { icon: Car, color: '#0ea5e9' },
  'Moradia': { icon: Home, color: '#8b5cf6' },
  'Lazer': { icon: Coffee, color: '#ec4899' },
  'Saúde': { icon: Heart, color: '#f43f5e' },
  'Educação': { icon: GraduationCap, color: '#10b981' },
  'Compras': { icon: ShoppingCart, color: '#f97316' },
  'Viagem': { icon: Plane, color: '#06b6d4' },
  'Jogos': { icon: Gamepad2, color: '#a855f7' },
};

function getConfig(cat: string) {
  return categoryConfig[cat] || { icon: CreditCard, color: '#94a3b8' };
}

export function SpendingByCategory({
  transactions,
  preferredCurrency = 'BRL',
}: {
  transactions: Transaction[];
  preferredCurrency?: string;
}) {
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map.set(t.category, (map.get(t.category) || 0) + Math.abs(t.amount));
      });

    const entries = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const total = entries.reduce((sum, [, v]) => sum + v, 0);
    return { entries, total };
  }, [transactions]);

  if (categories.entries.length === 0) return null;

  // Mini donut data
  const donutSize = 64;
  const strokeWidth = 8;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;
  const arcs = categories.entries.map(([cat, amount]) => {
    const pct = categories.total > 0 ? amount / categories.total : 0;
    const dashLength = pct * circumference;
    const gap = circumference - dashLength;
    const offset = -accumulatedOffset;
    accumulatedOffset += dashLength;
    return { cat, amount, pct, dashLength, gap, offset };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="card-editorial p-4 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#f59e0b', opacity: 0.3 }} />

      <p className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
        Gastos por categoria
      </p>

      <div className="flex items-center gap-4">
        {/* Mini Donut */}
        <div className="relative shrink-0" style={{ width: donutSize, height: donutSize }}>
          <svg width={donutSize} height={donutSize} className="transform -rotate-90">
            <circle
              cx={donutSize / 2} cy={donutSize / 2} r={radius}
              fill="transparent" strokeWidth={strokeWidth}
              style={{ stroke: 'var(--border-color)', opacity: 0.3 }}
            />
            {arcs.map((arc, i) => (
              <motion.circle
                key={arc.cat}
                cx={donutSize / 2} cy={donutSize / 2} r={radius}
                fill="transparent"
                stroke={getConfig(arc.cat).color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arc.dashLength} ${arc.gap}`}
                strokeDashoffset={arc.offset}
                strokeLinecap="butt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {categories.entries.length}
            </span>
          </div>
        </div>

        {/* Category List */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {categories.entries.map(([cat, amount], i) => {
            const conf = getConfig(cat);
            const Icon = conf.icon;
            const pct = categories.total > 0 ? Math.round((amount / categories.total) * 100) : 0;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: conf.color }}
                  />
                  <span className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                    {cat}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {pct}%
                  </span>
                  <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(amount, preferredCurrency)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
