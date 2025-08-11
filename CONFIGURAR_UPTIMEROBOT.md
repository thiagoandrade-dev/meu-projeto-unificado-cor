# Configurar UptimeRobot - Guia Passo a Passo

## 🎯 Objetivo
Resolver o problema de "cold start" do Render mantendo o backend sempre ativo.

## 📋 Passo a Passo

### **1. Criar Conta no UptimeRobot**
1. Acesse: https://uptimerobot.com
2. Clique em **"Sign Up Free"**
3. Preencha:
   - Email: seu email
   - Password: crie uma senha segura
4. Clique em **"Sign Up"**
5. Verifique seu email e confirme a conta

### **2. Configurar Monitor**
1. Faça login no UptimeRobot
2. No dashboard, clique em **"+ Add New Monitor"**
3. Configure exatamente assim:

```
Monitor Type: HTTP(s)
Friendly Name: Imobiliária Firenze Backend
URL (or IP): https://imobiliaria-firenze-backend.onrender.com/api/status
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
```

4. Clique em **"Create Monitor"**

### **3. Verificar Configuração**
Após criar, você deve ver:
- ✅ Monitor ativo
- ✅ Status "Up"
- ✅ Próximo check em 5 minutos

### **4. Configurar Alertas (Opcional)**
1. Clique no monitor criado
2. Vá em **"Alert Contacts"**
3. Adicione seu email para receber notificações se o backend ficar offline

## 🎉 Resultado Esperado

### **Antes:**
- Backend "dorme" após 15 minutos
- Login falha quando backend está frio
- Usuário precisa aguardar 30-60 segundos

### **Depois:**
- Backend sempre ativo
- Login instantâneo
- Zero tempo de espera

## 📊 Monitoramento

O UptimeRobot vai:
- ✅ Fazer ping a cada 5 minutos
- ✅ Manter estatísticas de uptime
- ✅ Alertar se houver problemas
- ✅ Mostrar histórico de disponibilidade

## 🔧 Alternativa: GitHub Actions

Se preferir automação via GitHub:

1. **Commit o arquivo `.github/workflows/keep-alive.yml`**
2. **Push para o repositório**
3. **GitHub Actions fará ping automaticamente**

```bash
git add .github/workflows/keep-alive.yml
git commit -m "feat: Adiciona GitHub Actions para manter backend ativo"
git push
```

## 🆓 Plano Gratuito

**UptimeRobot Gratuito inclui:**
- ✅ 50 monitores
- ✅ Checks a cada 5 minutos
- ✅ 2 meses de logs
- ✅ Alertas por email
- ✅ Uptime de 99.9%

**Mais que suficiente para seu caso!**

## 🔍 Verificação

Para confirmar que está funcionando:

1. **Aguarde 5-10 minutos** após configurar
2. **Acesse seu sistema**: https://imobiliaria-firenze.vercel.app
3. **Teste o login** - deve funcionar instantaneamente
4. **Verifique o dashboard do UptimeRobot** - deve mostrar pings bem-sucedidos

## 🚨 Solução de Problemas

### **Se o monitor mostrar "Down":**
1. Verifique se a URL está correta
2. Teste manualmente: https://imobiliaria-firenze-backend.onrender.com/api/status
3. Verifique se o backend está funcionando

### **Se ainda houver cold start:**
1. Reduza o intervalo para 3 minutos (plano pago)
2. Use também o GitHub Actions como backup
3. Considere migrar para Railway

## ✅ Checklist Final

- [ ] Conta criada no UptimeRobot
- [ ] Monitor configurado
- [ ] URL correta inserida
- [ ] Intervalo de 5 minutos
- [ ] Monitor ativo e funcionando
- [ ] Login testado e funcionando

---
**🎉 Pronto! Seu backend nunca mais vai "dormir"!**

*Tempo total de configuração: 5 minutos*
*Custo: R$ 0,00*
*Resultado: 100% uptime*