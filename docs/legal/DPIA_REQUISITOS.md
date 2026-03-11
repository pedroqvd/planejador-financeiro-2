# Relatório de Impacto à Proteção de Dados (DPIA) — WealthCash

**Data:** 11 de Março de 2026  
**Status:** Documento de Governança Interna

## 1. Descrição do Tratamento
O WealthCash processa dados financeiros e pessoais para fornecer consultoria baseada em IA e agregação de contas. Devido à natureza sensível dos dados bancários (Open Finance) e ao uso de IA (Gemini), este tratamento é classificado como de alto risco sob a LGPD.

## 2. Necessidade e Proporcionalidade
- **Finalidade:** Melhorar a saúde financeira dos usuários através de insights automatizados.
- **Base Legal:** Execução de contrato e legítimo interesse.
- **Minimização:** Apenas transações e saldos necessários para cálculos de orçamento são processados. Dados brutos de conexão bancária ficam isolados no parceiro Pluggy.

## 3. Riscos Identificados e Medidas de Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
| :--- | :--- | :--- | :--- |
| Vazamento de Dados Bancários | Baixa | Crítico | Criptografia SSL 1.3, Isolamento de DB, Tokens expirados. |
| Viés Algorítmico (IA) | Média | Médio | Disclaimers claros de que a IA não substitui consultoria oficial. |
| Acesso Indevido (Conta) | Média | Alto | MFA (Roadmap TI), Bloqueio após múltiplas tentativas. |

## 4. Conclusão do Encarregado (DPO)
O tratamento de dados é lícito e os riscos residuais estão dentro de patamares aceitáveis, desde que o Roadmap de TI (MFA e Auditoria) seja executado conforme planejado.

---

> [!IMPORTANT]
> Este documento deve ser apresentado à ANPD caso solicitado durante uma fiscalização.
