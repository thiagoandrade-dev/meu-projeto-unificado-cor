# ⚡ Configurar Gmail - Solução Rápida

## 🎯 **Objetivo**
Configurar e-mails funcionando **AGORA** usando Gmail gratuito.

## 🚀 **Passo a Passo Rápido (5 minutos)**

### **1. Criar/Usar Conta Gmail**
1. **Acessar**: https://gmail.com
2. **Criar conta**: `imobiliariafirenze@gmail.com`
   - Ou usar conta existente
3. **Anotar credenciais**

### **2. Ativar Verificação em 2 Etapas**
1. **Gmail** → **Configurações** → **Segurança**
2. **Verificação em 2 etapas** → **Ativar**
3. **Confirmar** com telefone

### **3. Gerar Senha de App**
1. **Segurança** → **Senhas de app**
2. **Selecionar app**: "E-mail"
3. **Gerar senha** → **Copiar** (ex: `abcd efgh ijkl mnop`)

### **4. Configurar no Sistema**
Editar arquivo `.env` do backend:

```env
# Configurações Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=imobiliariafirenze@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM_NAME=Imobiliária Firenze
EMAIL_FROM_EMAIL=imobiliariafirenze@gmail.com
```

### **5. Testar Sistema**
1. **Acessar**: https://imobiliaria-firenze.vercel.app/admin
2. **Login**: `admin@imobiliariafirenze.com.br` / `admin123`
3. **Configurações** → **E-mail**
4. **Salvar** e **testar envio**

## ✅ **Resultado**
- ✅ **E-mails funcionando** em 5 minutos
- ✅ **500 e-mails/dia** grátis
- ✅ **Altamente confiável**
- ⚠️ **Remetente**: `imobiliariafirenze@gmail.com`

## 🔄 **Migração Futura**
Quando Resend voltar:
1. **Manter Gmail** funcionando
2. **Configurar Resend** em paralelo
3. **Migrar** quando estiver estável

## 🆘 **Problemas Comuns**

### **Senha de app não funciona**
- Verificar se 2FA está ativo
- Regenerar nova senha
- Copiar sem espaços

### **SMTP não conecta**
- Verificar firewall
- Testar porta 465 (SSL)

### **E-mails vão para spam**
- Normal no início
- Melhorar com uso regular

## 🎯 **Próximos Passos**
1. ✅ **Configurar Gmail** (agora)
2. ✅ **Testar sistema**
3. ⏳ **Aguardar Resend** (futuro)
4. 🔄 **Migrar** quando possível