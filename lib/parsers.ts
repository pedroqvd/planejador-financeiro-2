// OFX/CSV Parser for Brazilian bank statements

export type ParsedTransaction = {
    name: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    category: string;
};

// Auto-categorize by keywords
const categoryRules: { keywords: string[]; category: string }[] = [
    { keywords: ['mercado', 'supermercado', 'padaria', 'açougue', 'ifood', 'rappi', 'uber eats', 'restaurante', 'lanchonete', 'pizza', 'burger'], category: 'Alimentação' },
    { keywords: ['uber', '99', 'cabify', 'combustivel', 'gasolina', 'estacionamento', 'pedagio', 'metrô', 'metro', 'onibus', 'bilhete unico'], category: 'Transporte' },
    { keywords: ['aluguel', 'condominio', 'iptu', 'luz', 'energia', 'agua', 'gas', 'internet', 'celular', 'telefone'], category: 'Moradia' },
    { keywords: ['cinema', 'netflix', 'spotify', 'disney', 'hbo', 'amazon prime', 'teatro', 'show', 'bar', 'festa', 'viagem', 'hotel'], category: 'Lazer' },
    { keywords: ['salario', 'salário', 'pagamento', 'freelance', 'pix recebido', 'transferencia recebida', 'rendimento', 'dividendo', 'juros'], category: 'Salário' },
];

function categorize(description: string): string {
    const lower = description.toLowerCase();
    for (const rule of categoryRules) {
        if (rule.keywords.some(kw => lower.includes(kw))) {
            return rule.category;
        }
    }
    return 'Outros';
}

function sanitize(str: string): string {
    return str.replace(/[<>]/g, '').trim().slice(0, 200);
}

// ========== OFX Parser ==========

export function parseOFX(content: string): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = [];

    // Find all STMTTRN blocks
    const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;

    while ((match = stmtTrnRegex.exec(content)) !== null) {
        const block = match[1];

        const getTag = (tag: string): string => {
            // OFX can be SGML (no closing tags) or XML
            const xmlMatch = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, 'i'));
            if (xmlMatch) return xmlMatch[1].trim();

            const sgmlMatch = block.match(new RegExp(`<${tag}>(.+)`, 'im'));
            if (sgmlMatch) return sgmlMatch[1].trim();

            return '';
        };

        const trnType = getTag('TRNTYPE');
        const dateStr = getTag('DTPOSTED');
        const amountStr = getTag('TRNAMT');
        const memo = getTag('MEMO') || getTag('NAME') || 'Transação importada';

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount === 0) continue;

        // Parse OFX date format: YYYYMMDD or YYYYMMDDHHMMSS
        let date = new Date().toISOString();
        if (dateStr.length >= 8) {
            const year = dateStr.slice(0, 4);
            const month = dateStr.slice(4, 6);
            const day = dateStr.slice(6, 8);
            date = new Date(`${year}-${month}-${day}`).toISOString();
        }

        const isIncome = amount > 0 || trnType.toUpperCase() === 'CREDIT';
        const absAmount = Math.abs(amount);
        const name = sanitize(memo);

        transactions.push({
            name,
            amount: absAmount,
            type: isIncome ? 'income' : 'expense',
            date,
            category: categorize(name),
        });
    }

    return transactions;
}

// ========== CSV Parser ==========

export function parseCSV(content: string): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = [];
    const lines = content.split(/\r?\n/).filter(line => line.trim());

    if (lines.length < 2) return transactions;

    // Detect separator
    const separator = lines[0].includes(';') ? ';' : ',';

    // Parse header to find columns
    const header = lines[0].toLowerCase().split(separator).map(h => h.replace(/"/g, '').trim());

    // Common column name mappings (PT-BR + EN)
    const dateIdx = header.findIndex(h =>
        ['data', 'date', 'dt', 'data lancamento', 'data lançamento', 'data mov'].includes(h)
    );
    const descIdx = header.findIndex(h =>
        ['descricao', 'descrição', 'description', 'historico', 'histórico', 'lancamento', 'lançamento', 'memo', 'nome'].includes(h)
    );
    const amountIdx = header.findIndex(h =>
        ['valor', 'amount', 'value', 'quantia', 'vlr'].includes(h)
    );

    // Fallback: if columns not found, try positional
    const dIdx = dateIdx >= 0 ? dateIdx : 0;
    const nIdx = descIdx >= 0 ? descIdx : 1;
    const aIdx = amountIdx >= 0 ? amountIdx : header.length - 1;

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(separator).map(c => c.replace(/"/g, '').trim());
        if (cols.length < 2) continue;

        const rawDate = cols[dIdx] || '';
        const rawName = cols[nIdx] || 'Transação importada';
        const rawAmount = cols[aIdx] || '0';

        // Parse amount (handle BR format: 1.234,56)
        const cleanAmount = rawAmount
            .replace(/[R$\s]/g, '')
            .replace(/\./g, '')
            .replace(',', '.');
        const amount = parseFloat(cleanAmount);
        if (isNaN(amount) || amount === 0) continue;

        // Parse date (try common formats)
        let date: string;
        const dateParts = rawDate.match(/(\d{1,4})[/\-.](\d{1,2})[/\-.](\d{1,4})/);
        if (dateParts) {
            const [, a, b, c] = dateParts;
            // DD/MM/YYYY (BR format)
            if (a.length <= 2 && c.length === 4) {
                date = new Date(`${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`).toISOString();
            }
            // YYYY-MM-DD
            else if (a.length === 4) {
                date = new Date(`${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`).toISOString();
            } else {
                date = new Date().toISOString();
            }
        } else {
            date = new Date().toISOString();
        }

        const isIncome = amount > 0;
        const name = sanitize(rawName);

        transactions.push({
            name,
            amount: Math.abs(amount),
            type: isIncome ? 'income' : 'expense',
            date,
            category: categorize(name),
        });
    }

    return transactions;
}
