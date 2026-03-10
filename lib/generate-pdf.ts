import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportData {
    income: number;
    expenses: number;
    balance: number;
    categoryBreakdown: { category: string; total: number; percentage: number }[];
    topExpenses: { name: string; category: string; amount: number }[];
}

function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function generateFinancialPDF(data: ReportData, dateFilter: string) {
    // Config: A4 portrait
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Colors based on premium theme
    const INK = '#0f172a';
    const EMERALD = '#10b981';
    const ROSE = '#fb7185';
    const SLATE_500 = '#64748b';

    // --- HEADER ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(INK);
    doc.text('WealthCash', 14, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(SLATE_500);

    const reportPeriod = dateFilter === 'all'
        ? 'Período: Completo'
        : `Mês: ${format(new Date(dateFilter + '-01T12:00:00Z'), 'MMMM yyyy', { locale: ptBR })}`;

    doc.text(`Relatório Financeiro • ${reportPeriod}`, 14, yPos);

    const generatedAt = `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`;
    doc.text(generatedAt, pageWidth - 14 - doc.getTextWidth(generatedAt), yPos);

    yPos += 12;
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 16;

    // --- EXECUTIVE SUMMARY ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(INK);
    doc.text('Resumo Executivo', 14, yPos);
    yPos += 10;

    const boxWidth = (pageWidth - 28 - 20) / 3;

    // Income Box
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.roundedRect(14, yPos, boxWidth, 25, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(EMERALD);
    doc.text('Receitas', 14 + 5, yPos + 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(data.income), 14 + 5, yPos + 18);

    // Expenses Box
    doc.setFillColor(255, 241, 242); // rose-50
    doc.roundedRect(14 + boxWidth + 10, yPos, boxWidth, 25, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(ROSE);
    doc.text('Despesas', 14 + boxWidth + 10 + 5, yPos + 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(data.expenses), 14 + boxWidth + 10 + 5, yPos + 18);

    // Balance Box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14 + (boxWidth * 2) + 20, yPos, boxWidth, 25, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(INK);
    doc.text('Saldo', 14 + (boxWidth * 2) + 20 + 5, yPos + 8);
    doc.setFontSize(14);
    doc.text(formatCurrency(data.balance), 14 + (boxWidth * 2) + 20 + 5, yPos + 18);

    yPos += 40;

    // --- CATEGORY BREAKDOWN ---
    doc.setFontSize(14);
    doc.text('Distribuição por Categoria', 14, yPos);
    yPos += 6;

    const categoryHead = [['Categoria', 'Porcentagem', 'Total Gasto']];
    const categoryBody = data.categoryBreakdown.map(cat => [
        cat.category,
        `${cat.percentage}%`,
        formatCurrency(cat.total)
    ]);

    (doc as any).autoTable({
        startY: yPos,
        head: categoryHead,
        body: categoryBody,
        theme: 'plain',
        headStyles: { fillColor: false, textColor: SLATE_500, fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { textColor: INK, fontSize: 10 },
        alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
        columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // --- TOP EXPENSES ---
    doc.setFontSize(14);
    doc.setTextColor(INK);
    doc.text('Maiores Gastos', 14, yPos);
    yPos += 6;

    const expensesHead = [['Descrição', 'Categoria', 'Valor']];
    const expensesBody = data.topExpenses.map(exp => [
        exp.name,
        exp.category,
        formatCurrency(exp.amount)
    ]);

    (doc as any).autoTable({
        startY: yPos,
        head: expensesHead,
        body: expensesBody,
        theme: 'plain',
        headStyles: { fillColor: false, textColor: SLATE_500, fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { textColor: INK, fontSize: 10 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
            2: { halign: 'right', fontStyle: 'bold', textColor: ROSE }
        },
        margin: { left: 14, right: 14 }
    });

    // --- FOOTER ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(
            `Página ${i} de ${pageCount} • Gerado de forma segura no WealthCash`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Download Action
    const filename = `WealthCash_Relatorio_${dateFilter === 'all' ? 'Completo' : dateFilter}.pdf`;
    doc.save(filename);
}
