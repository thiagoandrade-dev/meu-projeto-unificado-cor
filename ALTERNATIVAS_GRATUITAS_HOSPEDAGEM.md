# Alternativas Gratuitas para Hospedagem

## 🚨 Problema Atual
- **Render**: Backend "dorme" após 15 minutos de inatividade
- **Resultado**: Login falha quando backend está "frio"
- **Solução**: Manter backend ativo ou migrar

## 🆓 Alternativas 100% Gratuitas

### **1. Railway (Recomendado)**
```
✅ 500 horas/mês gratuitas (suficiente para baixo tráfego)
✅ Não dorme como o Render
✅ Deploy automático via GitHub
✅ Suporte Node.js + MongoDB
✅ Domínio personalizado gratuito
```

**Como migrar:**
1. Criar conta no Railway
2. Conectar repositório GitHub
3. Configurar variáveis de ambiente
4. Deploy automático

### **2. Fly.io**
```
✅ 3 aplicações gratuitas
✅ 160GB de transferência/mês
✅ Não dorme
✅ Excelente performance
✅ Suporte completo Node.js
```

### **3. Koyeb**
```
✅ 1 aplicação gratuita
✅ Não dorme
✅ Deploy via GitHub
✅ SSL automático
```

### **4. Cyclic (Descontinuado, mas alternativas)**
```
❌ Fechou recentemente
✅ Alternativa: Netlify Functions + PlanetScale
```

## 🔧 Soluções para Manter no Render

### **Opção A: Keep-Alive Script**
```javascript
// Usar o script keep-alive-render.js
// Roda localmente ou em serviço gratuito
// Faz ping a cada 14 minutos
```

### **Opção B: Cron Job Gratuito**
```
✅ cron-job.org (gratuito)
✅ UptimeRobot (50 monitores gratuitos)
✅ Pingdom (1 monitor gratuito)
```

**Configuração UptimeRobot:**
1. Criar conta gratuita
2. Adicionar monitor HTTP
3. URL: https://imobiliaria-firenze-backend.onrender.com/api/status
4. Intervalo: 5 minutos

### **Opção C: GitHub Actions (Gratuito)**
```yaml
# .github/workflows/keep-alive.yml
name: Keep Render Alive
on:
  schedule:
    - cron: '*/14 * * * *' # A cada 14 minutos
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: curl https://imobiliaria-firenze-backend.onrender.com/api/status
```

## 🏆 Minha Recomendação

### **Para Seu Caso (Baixo Tráfego):**

**1ª Opção: UptimeRobot + Render/Vercel**
```
💰 Custo: R$ 0
🔧 Trabalho: 5 minutos setup
⚡ Resultado: Backend sempre ativo
```

**2ª Opção: Migrar para Railway**
```
💰 Custo: R$ 0 (500h/mês)
🔧 Trabalho: 30 minutos migração
⚡ Resultado: Sem cold start
```

## 📋 Próximos Passos

### **Solução Rápida (5 minutos):**
1. Criar conta no UptimeRobot
2. Configurar monitor para seu backend
3. Problema resolvido!

### **Solução Definitiva (30 minutos):**
1. Migrar backend para Railway
2. Manter frontend na Vercel
3. Nunca mais cold start!

## 🤔 Qual Você Prefere?

**Quer que eu:**
1. **Configure o UptimeRobot** (solução rápida)
2. **Ajude a migrar para Railway** (solução definitiva)
3. **Configure GitHub Actions** (solução técnica)

**Todas são 100% gratuitas!** 🎉

---
*Criado em: 06/01/2025*
*Status: Aguardando decisão do usuário*