# Transparência de Dados e Parceiros (DPA) — WealthCash

Este documento detalha os acordos de processamento de dados (DPAs) entre o WealthCash e seus sub-processadores, garantindo a conformidade com a LGPD.

## Sub-processadores Autorizados

O WealthCash utiliza os seguintes parceiros para prestar seus serviços. Todos os parceiros abaixo possuem contratos que garantem o mesmo nível de proteção de dados exigido pela LGPD/GDPR.

| Parceiro | Finalidade | Jurisdição | Conformidade |
| :--- | :--- | :--- | :--- |
| **Google Cloud / Gemini** | Processamento de IA e Insights | Global/EUA | GDPR/LGPD/ISO 27001 |
| **Vercel** | Hospedagem da Aplicação | Global/EUA | SOC2 Type II / GDPR |
| **Neon (PostgreSQL)** | Banco de Dados Serverless | EUA | SOC2 / GDPR |
| **Mercado Pago** | Processamento de Pagamentos | Brasil/LATAM | PCI-DSS / LGPD |
| **Pluggy** | Agregação de Open Finance | Brasil | LGPD / Bacen |

## Acordos de Processamento de Dados (DPA)

1. **Minimização**: Apenas os dados estritamente necessários são enviados para cada parceiro (ex: o Mercado Pago não recebe seu histórico de gastos, apenas dados de faturamento).
2. **Segurança**: Todos os dados são transmitidos via túneis criptografados TLS 1.3.
3. **Direito de Auditoria**: Reservamo-nos o direito de solicitar relatórios de auditoria de nossos parceiros anualmente.

## Transferência Internacional
Quando os dados são processados fora do Brasil (como no caso do Google/Neon), utilizamos as **Cláusulas Contratuais Padrão (SCCs)** reconhecidas internacionalmente como mecanismo de transferência segura.

---

*Última revisão: Março de 2026*
