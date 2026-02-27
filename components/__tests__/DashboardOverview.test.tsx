import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock motion/react to avoid animation issues in tests
vi.mock('motion/react', () => {
    const MockDiv = React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLDivElement>) => (
        React.createElement('div', { ...filterMotionProps(props), ref }, children)
    ));
    MockDiv.displayName = 'motion.div';

    const MockP = React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLParagraphElement>) => (
        React.createElement('p', { ...filterMotionProps(props), ref }, children)
    ));
    MockP.displayName = 'motion.p';

    const MockPresence = ({ children }: React.PropsWithChildren) => React.createElement(React.Fragment, null, children);
    MockPresence.displayName = 'AnimatePresence';

    return {
        motion: {
            div: MockDiv,
            p: MockP,
        },
        AnimatePresence: MockPresence,
    };
});

function filterMotionProps(props: Record<string, unknown>) {
    const filtered = { ...props };
    delete filtered.initial;
    delete filtered.animate;
    delete filtered.exit;
    delete filtered.transition;
    delete filtered.whileHover;
    delete filtered.whileTap;
    return filtered;
}

import { DashboardOverview } from '../DashboardOverview';

describe('DashboardOverview', () => {
    it('should render skeleton when stats is null', () => {
        const { container } = render(<DashboardOverview stats={null} />);
        const pulsingElements = container.querySelectorAll('.animate-pulse');
        expect(pulsingElements.length).toBeGreaterThan(0);
    });

    it('should render all 4 stat cards when stats are provided', () => {
        render(
            <DashboardOverview
                stats={{
                    netWorth: 50000,
                    income: 8000,
                    expenses: 5000,
                    investments: 15000,
                }}
            />
        );

        // Check formatted currency values are in the document
        expect(screen.getByText(/Patrimônio Líquido/i)).toBeInTheDocument();
        expect(screen.getByText(/Receitas/i)).toBeInTheDocument();
        expect(screen.getByText(/Despesas/i)).toBeInTheDocument();
        expect(screen.getByText(/Investimentos/i)).toBeInTheDocument();
    });

    it('should display formatted currency values', () => {
        render(
            <DashboardOverview
                stats={{
                    netWorth: 12345.67,
                    income: 8000,
                    expenses: 3000,
                    investments: 5000,
                }}
            />
        );

        // Check that values are formatted in BRL
        expect(screen.getByText(/12\.345,67/)).toBeInTheDocument();
        expect(screen.getByText(/8\.000,00/)).toBeInTheDocument();
    });

    it('should render net worth card with special styling', () => {
        const { container } = render(
            <DashboardOverview
                stats={{ netWorth: 1000, income: 500, expenses: 200, investments: 300 }}
            />
        );

        // The first card (Patrimônio) should have dark background
        const darkCard = container.querySelector('.bg-zinc-900');
        expect(darkCard).toBeInTheDocument();
    });
});
