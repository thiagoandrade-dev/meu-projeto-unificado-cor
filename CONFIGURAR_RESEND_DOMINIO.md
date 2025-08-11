# 🚀 Configurar Resend.com com Domínio Personalizado

## 🎯 **Objetivo**
Configurar e-mails profissionais `contato@imobiliariafirenze.com.br` usando Resend.com **GRATUITO**.

## ✅ **Status Confirmado: Resend Funcionando!**
**Verificado em**: Janeiro 2025
- ✅ Site acessível
- ✅ API operacional  
- ✅ SMTP funcionando

## 📋 **Passo a Passo**

### **1. Criar Conta no Resend**
1. **Acessar**: https://resend.com ✅ **FUNCIONANDO**
2. **Criar conta** com seu e-mail
3. **Verificar e-mail**
4. **Fazer login**

> **💡 Dica**: Se tiver problemas no navegador, tente:
> - Limpar cache
> - Modo incógnito
> - Outro navegador

### **2. Adicionar Domínio**
1. **Dashboard Resend** → **Domains**
2. **Add Domain**
3. **Digite**: `imobiliariafirenze.com.br`
4. **Add Domain**

### **3. Configurar DNS (Registro.br)**
O Resend vai fornecer registros DNS. Adicione no **Registro.br**:

```dns
Tipo: TXT
Nome: _resend
Valor: [valor-fornecido-pelo-resend]
TTL: 3600

Tipo: MX
Nome: @
Valor: feedback-smtp.us-east-1.amazonses.com
Prioridade: 10
TTL: 3600
```

### **4. Obter API Key**
1. **Dashboard Resend** → **API Keys**
2. **Create API Key**
3. **Nome**: `Imobiliaria-Firenze-Production`
4. **Permissions**: `Sending access`
5. **Copiar a chave** (guarde bem!)

### **5. Configurar no Sistema**
Editar arquivo `.env` do backend:

```env
# Configurações Resend.com
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=resend
EMAIL_PASSWORD=re_sua-api-key-aqui
EMAIL_FROM_NAME=Imobiliária Firenze
EMAIL_FROM_EMAIL=contato@imobiliariafirenze.com.br
```

### **6. Testar Configuração**
1. **Acessar**: https://imobiliaria-firenze.vercel.app/admin
2. **Login**: `admin@imobiliariafirenze.com.br` / `admin123`
3. **Configurações** → **E-mail**
4. **Salvar configurações**
5. **Testar envio**

## ✅ **Verificações**

### **DNS Propagado?**
```bash
nslookup -type=TXT _resend.imobiliariafirenze.com.br
```

### **Domínio Verificado?**
- **Resend Dashboard** → **Domains**
- Status deve estar **"Verified"** ✅

### **E-mail Funcionando?**
- **Teste no sistema**
- **Verificar logs do Resend**

## 🎯 **Resultado Final**

### **Antes:**
```
De: imobiliariafirenze@gmail.com
Para: cliente@email.com
Assunto: Bem-vindo à Imobiliária Firenze
```

### **Depois:**
```
De: Imobiliária Firenze <contato@imobiliariafirenze.com.br>
Para: cliente@email.com
Assunto: Bem-vindo à Imobiliária Firenze
```

## 📊 **Benefícios**

| Aspecto | Antes (Gmail) | Depois (Resend) |
|---------|---------------|-----------------|
| Domínio | @gmail.com | @imobiliariafirenze.com.br |
| Profissional | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Limite | 500/dia | 3.000/mês |
| Analytics | ❌ | ✅ |
| Custo | R$ 0 | R$ 0 |

## 🆘 **Problemas Comuns**

### **DNS não propaga**
- Aguardar até 24h
- Verificar configuração no Registro.br

### **API Key inválida**
- Verificar se copiou corretamente
- Regenerar nova chave

### **E-mails não chegam**
- Verificar spam
- Verificar logs no Resend Dashboard

## 🚀 **Próximos Passos**

1. ✅ **Criar conta Resend**
2. ✅ **Adicionar domínio**
3. ✅ **Configurar DNS**
4. ✅ **Obter API Key**
5. ✅ **Configurar sistema**
6. ✅ **Testar envio**

**Pronto para começar?** 🎯