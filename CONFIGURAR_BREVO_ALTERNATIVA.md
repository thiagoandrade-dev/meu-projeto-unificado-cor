# 📧 Configurar Brevo - Alternativa Profissional

## 🎯 **Objetivo**
Configurar e-mails profissionais usando Brevo (ex-Sendinblue) **GRATUITO**.

## 🏆 **Por que Brevo?**
- ✅ **300 e-mails/dia** grátis
- ✅ **Dashboard profissional**
- ✅ **Domínio personalizado** (opcional)
- ✅ **Muito confiável**
- ✅ **Interface em português**

## 🚀 **Passo a Passo**

### **1. Criar Conta Brevo**
1. **Acessar**: https://brevo.com
2. **Criar conta gratuita**
3. **Verificar e-mail**
4. **Fazer login**

### **2. Obter Credenciais SMTP**
1. **Dashboard** → **Configurações**
2. **SMTP & API** → **SMTP**
3. **Anotar credenciais**:
   - **Servidor**: `smtp-relay.brevo.com`
   - **Porta**: `587`
   - **Login**: seu-email@brevo.com
   - **Senha**: senha-smtp-gerada

### **3. Configurar no Sistema**
Editar arquivo `.env` do backend:

```env
# Configurações Brevo
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu-email@brevo.com
EMAIL_PASSWORD=sua-senha-smtp
EMAIL_FROM_NAME=Imobiliária Firenze
EMAIL_FROM_EMAIL=seu-email@brevo.com
```

### **4. (Opcional) Domínio Personalizado**
1. **Configurações** → **Domínios**
2. **Adicionar**: `imobiliariafirenze.com.br`
3. **Configurar DNS** no Registro.br
4. **Verificar domínio**

### **5. Testar Sistema**
1. **Acessar**: https://imobiliaria-firenze.vercel.app/admin
2. **Configurações** → **E-mail**
3. **Salvar** e **testar**

## 📊 **Comparação**

| Aspecto | Gmail | Brevo | Resend |
|---------|-------|-------|--------|
| E-mails/dia | 500 | 300 | 100 |
| Domínio próprio | ❌ | ✅ | ✅ |
| Dashboard | ❌ | ✅ | ✅ |
| Status atual | ✅ | ✅ | ❌ |

## 🎯 **Recomendação**
1. **Agora**: Gmail (mais rápido)
2. **Depois**: Brevo (mais profissional)
3. **Futuro**: Resend (quando voltar)