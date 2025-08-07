# Correção de URLs Hardcoded

## Problema Identificado

O frontend estava tentando se conectar ao backend local (`http://localhost:5000/api`) mesmo com a variável de ambiente `VITE_API_URL` configurada corretamente para `https://imobiliaria-firenze-backend.onrender.com/api`.

### Erro Observado
```
🚀 URL final da API: http://localhost:5000/api 
🔍 Tentando login com URL: http://localhost:5000/api/auth/login 
❌ Erro no login: xe 
❌ Status: undefined 
❌ URL tentada: /auth/login 
❌ Base URL: http://localhost:5000/api 
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

## Causa Raiz

Vários arquivos do frontend tinham URLs hardcoded para `http://localhost:5000/api` em vez de usar a variável de ambiente `import.meta.env.VITE_API_URL`.

## Arquivos Corrigidos

### 1. `frontend/src/services/userService.ts`
**Antes:**
```typescript
const API_URL = 'http://localhost:5000/api';
```

**Depois:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### 2. `frontend/src/pages/TestLogin.tsx`
**Antes:**
```typescript
// URLs hardcoded em múltiplos locais
const healthCheck = await fetch('http://localhost:5000/api/status', {
const optionsResponse = await fetch('http://localhost:5000/api/auth/login', {
xhr.open('POST', 'http://localhost:5000/api/auth/login', true);
const fetchResponse = await fetch('http://localhost:5000/api/auth/login', {
```

**Depois:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Todas as URLs agora usam a variável
const healthCheck = await fetch(`${API_URL}/status`, {
const optionsResponse = await fetch(`${API_URL}/auth/login`, {
xhr.open('POST', `${API_URL}/auth/login`, true);
const fetchResponse = await fetch(`${API_URL}/auth/login`, {
```

### 3. `frontend/src/components/TestDashboard.tsx`
**Antes:**
```typescript
const response = await fetch('http://localhost:5000/api/dashboard', {
```

**Depois:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const response = await fetch(`${API_URL}/dashboard`, {
```

## Arquivos Já Corretos

- `frontend/src/services/apiService.ts` - Já estava usando `import.meta.env.VITE_API_URL`

## Configuração Atual

### Arquivo `.env` do Frontend
```
VITE_API_URL=https://imobiliaria-firenze-backend.onrender.com/api
VITE_SITE_URL=https://imobiliaria-firenze.vercel.app
VITE_COMPANY_NAME=Imobiliária Firenze
VITE_COMPANY_EMAIL=contato@imobiliariafirenze.com.br
VITE_SPECIALIZED_EMAIL_SALES=vendas@imobiliariafirenze.com.br
VITE_SPECIALIZED_EMAIL_RENTALS=locacoes@imobiliariafirenze.com.br
VITE_SPECIALIZED_EMAIL_SUPPORT=suporte@imobiliariafirenze.com.br
```

### Vite Config
O `vite.config.ts` está configurado para:
1. Priorizar `process.env.VITE_API_URL` (variáveis do Vercel)
2. Depois `env.VITE_API_URL` (arquivo .env)
3. Fallback para `https://imobiliaria-firenze-backend.onrender.com/api`

## Resultado

✅ **Frontend agora conecta corretamente ao backend de produção**
✅ **Não há mais tentativas de conexão com localhost:5000**
✅ **Hot reload funcionando corretamente**
✅ **Todas as URLs são configuráveis via variável de ambiente**

## Verificação

Para verificar se a correção está funcionando:

1. Abrir o console do navegador em `http://localhost:8081/`
2. Verificar que os logs mostram:
   ```
   🚀 URL final da API: https://imobiliaria-firenze-backend.onrender.com/api
   ```
3. Tentar fazer login - não deve mais aparecer erro de `ERR_CONNECTION_REFUSED`

## Prevenção

Para evitar problemas similares no futuro:

1. **Sempre usar variáveis de ambiente** para URLs de API
2. **Padrão recomendado:**
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
   ```
3. **Verificar todos os arquivos** antes de fazer deploy
4. **Usar busca por regex** para encontrar URLs hardcoded:
   ```bash
   # PowerShell
   Select-String -Pattern "localhost:5000|http://localhost:5000" -Path "src\**\*.ts" -Path "src\**\*.tsx"
   ```

---
**Data da Correção:** 07/01/2025  
**Status:** ✅ Resolvido