import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportData = {
    user: { name: string; email: string };
    month: string;
    year: number;
    summary: { income: number; expenses: number; balance: number; transactionCount: number };
    transactions: { name: string; category: string; amount: number; type: string; date: string }[];
    expensesByCategory: { category: string; total: number }[];
    budgets: { category: string; limit: number; spent: number; percentage: number }[];
    goals: { name: string; target: number; current: number; deadline: string }[];
};

function fmt(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function generatePDF(data: ReportData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // === HEADER ===
    doc.setFillColor(30, 30, 48);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('WealthCash', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Relatório Financeiro — ${data.month} ${data.year}`, 14, 28);
    doc.text(`${data.user.name} • ${data.user.email}`, 14, 35);

    const generatedDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.setFontSize(8);
    doc.text(`Gerado em ${generatedDate}`, pageWidth - 14, 35, { align: 'right' });

    y = 52;

    // === SUMMARY CARDS ===
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo do Mês', 14, y);
    y += 8;

    const cardWidth = (pageWidth - 42) / 3;
    const cards = [
        { label: 'Receitas', value: fmt(data.summary.income), color: [34, 197, 94] as [number, number, number] },
        { label: 'Despesas', value: fmt(data.summary.expenses), color: [239, 68, 68] as [number, number, number] },
        { label: 'Saldo', value: fmt(data.summary.balance), color: data.summary.balance >= 0 ? [34, 197, 94] as [number, number, number] : [239, 68, 68] as [number, number, number] },
    ];

    cards.forEach((card, i) => {
        const x = 14 + i * (cardWidth + 7);
        doc.setFillColor(245, 245, 250);
        doc.roundedRect(x, y, cardWidth, 22, 3, 3, 'F');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 120, 120);
        doc.text(card.label, x + 6, y + 8);

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(card.color[0], card.color[1], card.color[2]);
        doc.text(card.value, x + 6, y + 17);
    });

    y += 32;

    // === EXPENSES BY CATEGORY ===
    if (data.expensesByCategory.length > 0) {
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Despesas por Categoria', 14, y);
        y += 4;

        autoTable(doc, {
            startY: y,
            head: [['Categoria', 'Total', '% do Total']],
            body: data.expensesByCategory.map(c => [
                c.category,
                fmt(c.total),
                data.summary.expenses > 0 ? `${Math.round((c.total / data.summary.expenses) * 100)}%` : '0%',
            ]),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], fontSize: 9, font: 'helvetica' },
            bodyStyles: { fontSize: 9 },
            margin: { left: 14, right: 14 },
        });

        y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    }

    // === BUDGET STATUS ===
    if (data.budgets.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Status do Orçamento', 14, y);
        y += 4;

        autoTable(doc, {
            startY: y,
            head: [['Categoria', 'Gasto', 'Limite', 'Uso']],
            body: data.budgets.map(b => [
                b.category,
                fmt(b.spent),
                fmt(b.limit),
                `${b.percentage}%`,
            ]),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], fontSize: 9 },
            bodyStyles: { fontSize: 9 },
            didParseCell: (hookData) => {
                if (hookData.section === 'body' && hookData.column.index === 3) {
                    const pct = parseInt(hookData.cell.raw as string);
                    if (pct > 100) hookData.cell.styles.textColor = [239, 68, 68];
                    else if (pct > 80) hookData.cell.styles.textColor = [245, 158, 11];
                    else hookData.cell.styles.textColor = [34, 197, 94];
                    hookData.cell.styles.fontStyle = 'bold';
                }
            },
            margin: { left: 14, right: 14 },
        });

        y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    }

    // === GOALS ===
    if (data.goals.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Metas', 14, y);
        y += 4;

        autoTable(doc, {
            startY: y,
            head: [['Meta', 'Atual', 'Alvo', 'Progresso', 'Prazo']],
            body: data.goals.map(g => [
                g.name,
                fmt(g.current),
                fmt(g.target),
                g.target > 0 ? `${Math.round((g.current / g.target) * 100)}%` : '0%',
                g.deadline,
            ]),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], fontSize: 9 },
            bodyStyles: { fontSize: 9 },
            margin: { left: 14, right: 14 },
        });

        y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    }

    // === TRANSACTIONS LIST ===
    if (data.transactions.length > 0) {
        if (y > 200) { doc.addPage(); y = 20; }

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Transações (${data.summary.transactionCount})`, 14, y);
        y += 4;

        autoTable(doc, {
            startY: y,
            head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
            body: data.transactions.map(t => [
                t.date,
                t.name.slice(0, 30),
                t.category,
                t.type === 'income' ? 'Receita' : 'Despesa',
                fmt(t.amount),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            didParseCell: (hookData) => {
                if (hookData.section === 'body' && hookData.column.index === 3) {
                    hookData.cell.styles.textColor = hookData.cell.raw === 'Receita'
                        ? [34, 197, 94]
                        : [239, 68, 68];
                    hookData.cell.styles.fontStyle = 'bold';
                }
            },
            margin: { left: 14, right: 14 },
        });
    }

    // === FOOTER on every page ===
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text(
            `WealthCash — Relatório Financeiro • Página ${i} de ${totalPages}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 8,
            { align: 'center' }
        );
    }

    // Download
    doc.save(`WealthCash_Relatorio_${data.month}_${data.year}.pdf`);
}
