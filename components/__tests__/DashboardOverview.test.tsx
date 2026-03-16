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

    const MockCircle = React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<SVGCircleElement>) => (
        React.createElement('circle', { ...filterMotionProps(props), ref }, children)
    ));
    MockCircle.displayName = 'motion.circle';

    const MockSpan = React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLSpanElement>) => (
        React.createElement('span', { ...filterMotionProps(props), ref }, children)
    ));
    MockSpan.displayName = 'motion.span';

    const MockPresence = ({ children }: React.PropsWithChildren) => React.createElement(React.Fragment, null, children);
    MockPresence.displayName = 'AnimatePresence';

    return {
        motion: {
            div: MockDiv,
            p: MockP,
            circle: MockCircle,
            span: MockSpan,
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

    it('should render all 3 stat cards and health bar when stats are provided', () => {
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

        // Check new card labels are in the document
        expect(screen.getByText(/Receitas/i)).toBeInTheDocument();
        expect(screen.getByText(/Despesas/i)).toBeInTheDocument();
        expect(screen.getByText(/Saldo Líquido/i)).toBeInTheDocument();
        expect(screen.getByText(/Saúde Financeira/i)).toBeInTheDocument();
    });

    it('should display formatted currency values for income, expenses, and balance', () => {
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
        // 8000 (Income), 3000 (Expenses), 5000 (Balance & Investments)
        expect(screen.getByText(/8\.000,00/)).toBeInTheDocument();
        expect(screen.getByText(/3\.000,00/)).toBeInTheDocument();
        // Balance (8000-3000=5000) and Investments (5000) both show 5.000,00
        expect(screen.getAllByText(/5\.000,00/).length).toBeGreaterThanOrEqual(1);
    });

    it('should render balance card with editorial styling', () => {
        const { container } = render(
            <DashboardOverview
                stats={{ netWorth: 1000, income: 500, expenses: 200, investments: 300 }}
            />
        );

        // The balance card should use card-editorial class
        const editorialCards = container.querySelectorAll('.card-editorial');
        expect(editorialCards.length).toBeGreaterThan(0);
        expect(screen.getByText(/Saldo Líquido/i)).toBeInTheDocument();
    });
});
