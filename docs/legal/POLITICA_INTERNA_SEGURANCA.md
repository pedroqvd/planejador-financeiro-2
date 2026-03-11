# Política Interna de Segurança da Informação (PISI) — WealthCash

**Versão:** 1.0  
**Data:** 11 de Março de 2026

## 1. Objetivo
Garantir a confidencialidade, integridade e disponibilidade das informações dos usuários e da empresa, estabelecendo diretrizes de conduta para todos que possuem acesso aos sistemas do WealthCash.

## 2. Escopo
Aplica-se a todos os desenvolvedores, prestadores de serviço, administradores e parceiros com acesso ao código-fonte, banco de dados ou infraestrutura de nuvem.

## 3. Diretrizes de Acesso
- **MFA Obrigatório**: Todos os acessos a painéis administrativos (Vercel, Neon, Google Cloud, GitHub) devem utilizar autenticação de dois fatores.
- **Princípio do Menor Privilégio**: O acesso a dados de produção deve ser limitado apenas ao pessoal essencial e pelo tempo mínimo necessário.
- **Gestão de Segredos**: Segredos de API, chaves de banco de dados e certificados nunca devem ser compartilhados via chat ou armazenados em texto plano no código. Utilize o Vercel Environment Variables ou AWS Secrets Manager.

## 4. Segurança no Desenvolvimento
- **Code Reviews**: Todo código que manipula dados sensíveis deve passar por revisão por pares antes do merge.
- **Sanitização de Dados**: É obrigatório o uso de funções de sanitização (`sanitize`) e ORMs (Prisma) para evitar SQL Injection e XSS.
- **Logs de Auditoria**: Nenhuma informação sensível (PII, saldos, senhas) deve ser escrita em logs de aplicação.

## 5. Resposta a Incidentes
Qualquer suspeita de vazamento ou acesso não autorizado deve ser comunicada imediatamente ao DPO (Encarregado de Dados) em `dpo@wealthcash.com.br`.

---

> [!WARNING]
> A violação destas diretrizes pode resultar em sanções disciplinares, rescisão de contrato e medidas judiciais cabíveis.
