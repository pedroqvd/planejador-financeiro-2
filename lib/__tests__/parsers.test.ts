import { describe, it, expect } from 'vitest';
import { parseOFX, parseCSV } from '../parsers';

// ==================== parseOFX ====================

describe('parseOFX', () => {
    it('should parse valid OFX transactions', () => {
        const ofx = `
      <STMTTRN>
        <TRNTYPE>DEBIT
        <DTPOSTED>20250115
        <TRNAMT>-150.00
        <MEMO>Supermercado Extra
      </STMTTRN>
      <STMTTRN>
        <TRNTYPE>CREDIT
        <DTPOSTED>20250120
        <TRNAMT>5000.00
        <MEMO>Salário Janeiro
      </STMTTRN>
    `;

        const result = parseOFX(ofx);
        expect(result).toHaveLength(2);

        expect(result[0].name).toBe('Supermercado Extra');
        expect(result[0].amount).toBe(150);
        expect(result[0].type).toBe('expense');
        expect(result[0].category).toBe('Alimentação');

        expect(result[1].name).toBe('Salário Janeiro');
        expect(result[1].amount).toBe(5000);
        expect(result[1].type).toBe('income');
        expect(result[1].category).toBe('Salário');
    });

    it('should parse XML-style OFX (with closing tags)', () => {
        const ofx = `
      <STMTTRN>
        <TRNTYPE>DEBIT</TRNTYPE>
        <DTPOSTED>20250201120000</DTPOSTED>
        <TRNAMT>-89.90</TRNAMT>
        <MEMO>Uber viagem</MEMO>
      </STMTTRN>
    `;

        const result = parseOFX(ofx);
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('Transporte');
        expect(result[0].amount).toBe(89.90);
    });

    it('should return empty array for invalid OFX', () => {
        expect(parseOFX('')).toHaveLength(0);
        expect(parseOFX('no transactions here')).toHaveLength(0);
    });

    it('should skip zero-amount transactions', () => {
        const ofx = `
      <STMTTRN>
        <TRNTYPE>DEBIT
        <DTPOSTED>20250115
        <TRNAMT>0.00
        <MEMO>Zero value
      </STMTTRN>
    `;
        expect(parseOFX(ofx)).toHaveLength(0);
    });

    it('should parse dates correctly from YYYYMMDD format', () => {
        const ofx = `
      <STMTTRN>
        <TRNTYPE>DEBIT
        <DTPOSTED>20251231
        <TRNAMT>-50.00
        <MEMO>Test
      </STMTTRN>
    `;
        const result = parseOFX(ofx);
        expect(result[0].date).toContain('2025-12-31');
    });

    it('should categorize transport keywords', () => {
        const ofx = `
      <STMTTRN>
        <TRNTYPE>DEBIT
        <DTPOSTED>20250115
        <TRNAMT>-35.00
        <MEMO>99 Corrida
      </STMTTRN>
    `;
        const result = parseOFX(ofx);
        expect(result[0].category).toBe('Transporte');
    });

    it('should fallback to "Outros" for unknown categories', () => {
        const ofx = `
      <STMTTRN>
        <TRNTYPE>DEBIT
        <DTPOSTED>20250115
        <TRNAMT>-100.00
        <MEMO>Something Unknown
      </STMTTRN>
    `;
        const result = parseOFX(ofx);
        expect(result[0].category).toBe('Outros');
    });
});

// ==================== parseCSV ====================

describe('parseCSV', () => {
    it('should parse semicolon-separated CSV (BR format)', () => {
        const csv = [
            'Data;Descrição;Valor',
            '15/01/2025;Supermercado Extra;-150,00',
            '20/01/2025;Salário Janeiro;5.000,00',
        ].join('\n');

        const result = parseCSV(csv);
        expect(result).toHaveLength(2);

        expect(result[0].name).toBe('Supermercado Extra');
        expect(result[0].amount).toBe(150);
        expect(result[0].type).toBe('expense');

        expect(result[1].name).toBe('Salário Janeiro');
        expect(result[1].amount).toBe(5000);
        expect(result[1].type).toBe('income');
    });

    it('should parse comma-separated CSV (EN format)', () => {
        const csv = [
            'date,description,amount',
            '2025-01-15,Netflix,-29.90',
            '2025-01-20,Freelance,1500.00',
        ].join('\n');

        const result = parseCSV(csv);
        expect(result).toHaveLength(2);
        expect(result[0].category).toBe('Lazer'); // netflix
        expect(result[1].type).toBe('income');
    });

    it('should handle quoted fields', () => {
        const csv = [
            '"Data";"Historico";"Valor"',
            '"15/01/2025";"Padaria do Bairro";"-12,50"',
        ].join('\n');

        const result = parseCSV(csv);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Padaria do Bairro');
        expect(result[0].category).toBe('Alimentação');
    });

    it('should return empty for CSV with only header', () => {
        expect(parseCSV('Data;Valor')).toHaveLength(0);
    });

    it('should return empty for empty string', () => {
        expect(parseCSV('')).toHaveLength(0);
    });

    it('should skip zero-value rows', () => {
        const csv = [
            'data,description,amount',
            '2025-01-01,Test,0',
        ].join('\n');
        expect(parseCSV(csv)).toHaveLength(0);
    });

    it('should handle R$ prefix in amounts', () => {
        const csv = [
            'Data;Descrição;Valor',
            '15/01/2025;Aluguel;R$ -2.500,00',
        ].join('\n');

        const result = parseCSV(csv);
        expect(result).toHaveLength(1);
        expect(result[0].amount).toBe(2500);
        expect(result[0].category).toBe('Moradia');
    });

    it('should handle DD/MM/YYYY date format', () => {
        const csv = [
            'Data;Descrição;Valor',
            '31/12/2025;Festa;-100,00',
        ].join('\n');

        const result = parseCSV(csv);
        expect(result[0].date).toContain('2025-12-31');
    });

    it('should handle YYYY-MM-DD date format', () => {
        const csv = [
            'date,description,amount',
            '2025-06-15,Netflix,-29.90',
        ].join('\n');

        const result = parseCSV(csv);
        expect(result[0].date).toContain('2025-06-15');
    });
});
