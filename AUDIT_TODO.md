# Auditoria Completa — WealthCash
**Data:** 2026-03-14
**Total de itens:** 38

---

## CRÍTICO — Funcionalidades Quebradas/Inoperantes

### 1. Página de Investimentos é 100% mock
- **Arquivo:** `app/investments/page.tsx`
- Dados hardcoded: `R$ 142.500,00`, `14.5% a.a.`, perfil `"Moderado"`
- Não conecta com o model `Investment` do Prisma
- **Ação:** Criar API `/api/investments` e integrar com dados reais

### 2. Email de recuperação de senha não é enviado
- **Arquivo:** `app/forgot-password/page.tsx`
- Token de reset é gerado mas nenhum serviço de email está integrado
- Funciona apenas em dev (mostra link na tela)
- **Ação:** Integrar serviço de email (Resend, SendGrid, ou SES)

### 3. Página de Faturas é decorativa
- **Arquivo:** `app/faturas/page.tsx`
- Limite de cartão hardcoded (`mockLimit = 6000`)
- Nenhum dado real de cartão é buscado
- **Ação:** Definir se feature será implementada ou removida

### 4. Webhook MercadoPago incompleto
- **Arquivo:** `app/api/webhooks/mercado-pago/route.ts`
- Código de ativação guardado em `to_do_later_important/`
- Webhook não verifica pagamento real via API do MercadoPago
- **Ação:** Implementar verificação de pagamento e ativação de plano

### 5. Bypass de MFA no middleware
- **Arquivo:** `middleware.ts` (linhas 30, 49)
- Condição `mfaVerified !== false` permite `undefined`/`null` passar
- **Fix:** Mudar para `mfaVerified === true`

---

## ALTO — Bugs e Inconsistências Sérias

### 6. Validação de senha inconsistente (UI vs API)
- **Arquivo:** `app/reset-password/page.tsx` (linhas 97-98)
- UI: placeholder "Mínimo 6 caracteres", `minLength={6}`
- API: exige 8 caracteres
- **Fix:** Atualizar para `minLength={8}` e placeholder "Mínimo 8 caracteres"

### 7. Crash potencial na rota AI
- **Arquivo:** `app/api/ai/route.ts` (linhas 90-91)
- `aiLastInteractionAt.toDateString()` sem null check
- Usuário novo sem interação anterior causa erro
- **Fix:** Adicionar `aiLastInteractionAt?.toDateString()` com fallback

### 8. Campo de quota AI com nome enganoso
- **Arquivo:** `app/api/ai/route.ts` (linha 113)
- Campo `aiRequestsPerMonth` mas lógica reseta por dia
- Mensagem de erro diz "diárias"
- **Fix:** Renomear para `aiRequestsToday` ou ajustar lógica

### 9. Goals sem UI para atualizar progresso
- **Arquivo:** `app/goals/page.tsx`
- Endpoint PUT existe em `/api/goals` mas sem botão/modal na UI
- **Ação:** Criar modal de atualização de progresso

### 10. Dashboard usa `window.location.reload()`
- **Arquivo:** `app/page.tsx` (linhas 309-319)
- Anti-pattern: perde contexto, animações e estado do chat
- **Fix:** Usar callback `fetchDashboard()` em vez de reload

### 11. Lógica de MFA com falha no JWT
- **Arquivo:** `lib/auth.ts` (linhas 107-111)
- No refresh do token, MFA habilitado mas não verificado pode ser marcado como `mfaVerified: true`
- **Fix:** Corrigir condicionais do MFA no JWT callback

### 12. JWT callback faz query no DB em toda request
- **Arquivo:** `lib/auth.ts`
- `prisma.user.findUnique()` executado a cada refresh de token
- Performance issue severo em produção
- **Fix:** Cachear dados do user no token, atualizar apenas periodicamente

### 13. N+1 query no Pluggy sync
- **Arquivo:** `lib/pluggy-sync.ts` (linhas 46-51)
- Carrega TODAS as transações para criar Set de IDs
- **Fix:** Usar `select: { pluggyTransactionId: true }` para limitar dados

### 14. Divisão por zero no Sparkline
- **Arquivo:** `components/DashboardOverview.tsx` (linhas 22-30)
- Se `data.length === 1`, calcula `i / 0 = Infinity` nas coordenadas SVG
- **Fix:** Adicionar guard `if (data.length <= 1) return fallback`

### 15. Mimetype hardcoded no scan de recibos
- **Arquivo:** `app/api/ai/scan/route.ts` (linha 65)
- Sempre `'image/jpeg'`, ignora PNG, WebP, etc.
- **Fix:** Usar o tipo real da imagem enviada

### 16. Enum mismatch em recorrências
- **Arquivo:** `app/api/recurrences/route.ts` (linha 39)
- API aceita `'yearly'`, UI mostra `'anual'`
- **Fix:** Padronizar valores entre frontend e backend

---

## MÉDIO — Ineficiências e Código Problemático

### 17-18. `formatCurrency` duplicado
- **Arquivos:** `app/relatorios/page.tsx:33-35`, `app/faturas/page.tsx:8-10`
- **Fix:** Importar de `lib/currency.ts`

### 19. Email fallback fake no checkout
- **Arquivo:** `app/api/checkout/mercado-pago/route.ts` (linha 52)
- Usa `'test_user@testuser.com'` se email é null
- **Fix:** Rejeitar request se email é null

### 20. Preços de plano hardcoded
- **Arquivo:** `app/api/checkout/mercado-pago/route.ts` (linhas 6-9)
- **Fix:** Mover para configuração ou banco de dados

### 21. N+1 em loop de transações
- **Arquivo:** `app/api/transactions/route.ts` (linhas 160-162)
- `findFirst` + `updateMany` por transação, desnecessário
- **Fix:** Remover `findFirst`, `updateMany` já lida com "não encontrado"

### 22. Estados de webhook incompletos
- **Arquivo:** `app/api/webhooks/mercado-pago/route.ts` (linha 115)
- Só trata `'authorized'` e `'cancelled'`, ignora `'suspended'`, `'paused'`
- **Fix:** Tratar todos os estados possíveis

### 23. Serialização ineficiente no sync offline
- **Arquivo:** `lib/sync.ts` (linhas 29, 35)
- Cada operação reescreve todo o localStorage
- **Fix:** Batch operations ou usar IndexedDB

### 24. Erro de cache de câmbio silencioso
- **Arquivo:** `lib/currency.ts` (linhas 44-47)
- Parse failure logado mas taxa incorreta pode ser usada
- **Fix:** Invalidar cache em caso de erro de parse

### 25. Modelo Gemini inconsistente
- **Arquivo:** `app/api/ai/budget-planner/route.ts` (linha 76)
- Usa `'gemini-2.5-flash'` sem prefixo `models/`
- Outros endpoints usam `'models/gemini-2.0-flash'`
- **Fix:** Padronizar nome do modelo em constante central

### 26. Sanitização XSS incompleta
- **Arquivo:** `lib/utils.ts` (linha 13)
- Remove `<>&"'/\\` mas não trata entidades HTML encoded
- **Fix:** Usar biblioteca de sanitização (DOMPurify ou sanitize-html)

### 27. Goals sem validação de limites
- **Arquivo:** `app/api/goals/route.ts` (linhas 129-137)
- `current` pode ser negativo ou exceder `target`
- **Fix:** Validar `0 <= current <= target`

### 28. Forecast sem rate limiting
- **Arquivo:** `app/api/analytics/forecast/route.ts`
- Diferente de todas as outras rotas
- **Fix:** Adicionar `checkRateLimit()`

### 29. Excesso de `as any` no auth
- **Arquivo:** `lib/auth.ts` (múltiplas linhas)
- Campos do JWT sem type safety (plan, mfaEnabled, preferredCurrency)
- **Fix:** Declarar tipos para o JWT em `next-auth.d.ts`

---

## BAIXO — Melhorias de Qualidade

### 30. AbortController nunca usado
- **Arquivo:** `app/api/ai/scan/route.ts` (linhas 53-78)
- **Fix:** Remover ou usar o signal

### 31. Memory leak no AIAdvisor
- **Arquivo:** `components/AIAdvisor.tsx` (linha 48)
- Set `processedChips` cresce indefinidamente
- **Fix:** Limpar no cleanup do useEffect

### 32. `as any` no setInterval
- **Arquivo:** `components/AIAdvisor.tsx` (linha 56)
- **Fix:** Tipar corretamente com `ReturnType<typeof setInterval>`

### 33. Dead code no dashboard
- **Arquivo:** `app/page.tsx` (linha 290)
- `window.openChat?.()` referencia método inexistente
- **Fix:** Remover ou implementar

### 34. PrismaClient sem cache em produção
- **Arquivo:** `lib/prisma.ts` (linha 7)
- Múltiplas instâncias possíveis em produção
- **Fix:** Cachear em `globalThis` também em produção

### 35. Comentário enganoso no rate limit
- **Arquivo:** `lib/rate-limit.ts` (linhas 19-31)
- Diz "fail-closed" mas implementa fail-open em dev
- **Fix:** Corrigir comentário

### 36. Sem testes end-to-end
- Apenas 56 unit tests
- **Ação:** Implementar Playwright ou Cypress

### 37. Sem OAuth
- Login apenas por credentials
- **Ação:** Adicionar Google/GitHub OAuth

### 38. Cron jobs não automatizados
- Recorrências dependem de chamada manual
- **Ação:** Configurar Vercel Cron ou similar
