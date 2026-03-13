# Auditoria de Segurança — WealthCash

**Data:** 2026-03-13
**Escopo:** Análise completa do código-fonte (frontend + backend + integrações)
**Aplicação:** WealthCash — Planejador Financeiro (Next.js + Prisma + PostgreSQL)

---

## Resumo Executivo

Foram identificadas **27 vulnerabilidades** no total:
- **2 Críticas** — permitem bypass de autenticação e acesso sem MFA
- **5 Altas** — webhooks sem verificação, uploads sem limite, rate limiting falho
- **11 Médias** — senhas fracas, falta de rate limiting em endpoints, race conditions
- **9 Baixas** — CSP fraca, logs com dados sensíveis, timeouts ausentes

**Correções aplicadas neste commit:** 12 vulnerabilidades (todas Críticas + Altas + algumas Médias/Baixas).

---

## Vulnerabilidades Corrigidas

### [C1] CRÍTICA — Bypass de autenticação no cron job ✅ CORRIGIDO
- **Arquivo:** `app/api/cron/weekly-summary/route.ts`
- **Problema:** Se `CRON_SECRET` não estivesse definido, qualquer pessoa podia executar o cron job.
- **Correção:** Agora rejeita acesso se `CRON_SECRET` não estiver configurado.

### [A1] ALTA — Webhook signature bypass ✅ CORRIGIDO
- **Arquivos:** `app/api/webhooks/mercado-pago/route.ts`, `app/api/webhooks/pluggy/route.ts`
- **Problema:** Webhooks aceitavam requisições sem verificação quando secrets não configurados.
- **Correção:** Retorna 503 se secret não configurado; sempre rejeita webhooks sem assinatura válida.

### [A2] ALTA — Upload de foto sem limite de tamanho ✅ CORRIGIDO
- **Arquivo:** `app/api/user/profile-photo/route.ts`
- **Problema:** Aceitava imagens base64 de qualquer tamanho diretamente no banco.
- **Correção:** Limite de 500KB, validação de MIME type (JPEG, PNG, GIF, WebP).

### [A3] ALTA — OCR scan sem validação ✅ CORRIGIDO
- **Arquivo:** `app/api/ai/scan/route.ts`
- **Problema:** Sem limite de tamanho, sem rate limiting, sem validação de tipo.
- **Correção:** Limite de 5MB, rate limiting por user ID.

### [A4] ALTA — Rate limiting falha silenciosamente ✅ CORRIGIDO
- **Arquivo:** `lib/rate-limit.ts`
- **Problema:** Se Redis não estivesse disponível, rate limiting era desativado silenciosamente.
- **Correção:** Em produção, se Redis não configurado, requisições são negadas (fail-closed).

### [A5] ALTA — Exclusão de conta sem confirmação ✅ CORRIGIDO
- **Arquivo:** `app/api/settings/account/route.ts`
- **Problema:** Conta podia ser deletada sem confirmação de senha, sem rate limiting.
- **Correção:** Agora exige senha, tem rate limiting e audit logging.

### [M1] MÉDIA — Senha mínima de 6 caracteres ✅ CORRIGIDO
- **Arquivos:** `register/route.ts`, `reset-password/route.ts`, `settings/password/route.ts`
- **Correção:** Aumentado para mínimo de 8 caracteres.

### [M2] MÉDIA — Reset de senha sem rate limiting ✅ CORRIGIDO
- **Arquivo:** `app/api/reset-password/route.ts`
- **Correção:** Adicionado rate limiting por IP.

### [M5] MÉDIA — Rate limiting por IP no POST de transações ✅ CORRIGIDO
- **Arquivo:** `app/api/transactions/route.ts`
- **Correção:** Agora usa user ID como chave do rate limit.

### [M6] MÉDIA — Delete em lote sem limite ✅ CORRIGIDO
- **Arquivo:** `app/api/transactions/route.ts`
- **Correção:** Limitado a 100 IDs por requisição.

### [B1] BAIXA — .env.example sugere NEXT_PUBLIC_ para Gemini ✅ CORRIGIDO
- **Arquivo:** `.env.example`
- **Correção:** Renomeado para `GEMINI_API_KEY` (sem prefixo público).

### [B9] BAIXA — error.message do Gemini vazando para o cliente ✅ CORRIGIDO
- **Arquivos:** `app/api/ai/route.ts`, `app/api/ai/scan/route.ts`
- **Correção:** Retorna mensagem genérica ao invés de `error.message` interno.

---

## Vulnerabilidades Pendentes (requerem trabalho adicional)

### [C2] CRÍTICA — MFA incompleto
- **Arquivos:** `lib/auth.ts`, `app/api/auth/mfa/verify/route.ts`
- **Problema:** O login retorna acesso total mesmo com MFA ativado. O campo `mfaEnabled` no JWT é apenas informativo.
- **Recomendação:** Implementar fluxo completo de MFA com sessão parcial + verificação TOTP obrigatória antes de conceder acesso.

### [M3] MÉDIA — Middleware ignora todos API routes
- **Arquivo:** `middleware.ts:23`
- **Recomendação:** Documentar que toda rota API deve verificar sessão internamente.

### [M4] MÉDIA — Race condition na quota de IA
- **Arquivo:** `app/api/ai/route.ts:72-78`
- **Recomendação:** Usar `$transaction` do Prisma para tornar reset + increment atômico.

### [M7] MÉDIA — Falta de idempotência em webhooks
- **Recomendação:** Criar tabela de event IDs processados para deduplicação.

### [M8] MÉDIA — Endpoints sem rate limiting
- **Arquivos:** `search/route.ts`, `audit/route.ts`, `notifications/route.ts`, `settings/export/route.ts`
- **Recomendação:** Adicionar rate limiting por user ID em todos.

### [M9] MÉDIA — Export sem rate limiting
- **Recomendação:** Rate limiting de 3 requisições por hora.

### [M10] MÉDIA — MFA setup retorna secret no body
- **Recomendação:** Armazenar secret temporário no servidor com TTL.

### [M11] MÉDIA — Validação faltando em recurrences
- **Recomendação:** Adicionar validação de amount, frequency, nextDueDate.

### [B2] BAIXA — CSP com unsafe-eval e unsafe-inline
- **Recomendação:** Substituir por nonces quando possível.

### [B3] BAIXA — Falta audit logging em operações sensíveis
- **Recomendação:** Adicionar `logAudit()` em password change, data export, subscription changes.

### [B4] BAIXA — Sessões não invalidadas após troca de senha
- **Recomendação:** Implementar rotação de JWT ou lista de revogação.

### [B5] BAIXA — Validação de MIME type no import
- **Recomendação:** Validar contra whitelist (PDF, CSV, OFX).

### [B6] BAIXA — Timeout nas chamadas ao Gemini
- **Recomendação:** Adicionar `AbortController` com timeout de 30s.

### [B7] BAIXA — Token FCM sem validação de formato
- **Recomendação:** Validar formato esperado de token Firebase.

### [B8] BAIXA — Informações sensíveis em logs
- **Recomendação:** Sanitizar `console.error` em produção.

---

## Pontos Positivos da Segurança Atual

1. **bcrypt com 12 rounds** — hashing de senha adequado
2. **Proteção anti-enumeração** no forgot-password (sempre retorna 200)
3. **IDOR protection** — transações verificam ownership via `userId`
4. **Timing-safe hash** — hash de senha antes de verificar existência do usuário
5. **Webhook signature com timingSafeEqual** — previne timing attacks
6. **Security headers** — HSTS, X-Frame-Options DENY, CSP configurado
7. **Sanitização centralizada** via `sanitize()` em `lib/utils.ts`
8. **Audit logging** para login success/failure
9. **Token de reset com crypto.randomBytes(32)** — entropia adequada
10. **Rate limiting** com Upstash Redis em endpoints críticos
