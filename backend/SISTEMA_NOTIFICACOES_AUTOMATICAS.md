# 🔔 Sistema de Notificações Automáticas - Imobiliária Firenze

## 📋 Visão Geral

O Sistema de Notificações Automáticas da Imobiliária Firenze é uma solução completa para envio automático de e-mails personalizados para inquilinos e usuários do sistema. 

### ✨ Funcionalidades Principais

- 🎂 **Parabéns de Aniversário** - E-mails automáticos no aniversário dos inquilinos
- 👋 **Boas-vindas** - E-mails de boas-vindas para novos usuários
- 💰 **Lembretes de Vencimento** - Alertas de vencimento de aluguel
- 📈 **Reajuste Anual** - Notificações de reajuste de valores
- 🏠 **Vencimento de Contrato** - Lembretes de renovação de contrato

## 🚀 Como Usar

### 1. Testar o Sistema

Execute o script de teste para ver todos os templates em ação:

```bash
cd backend
node teste-notificacoes-automaticas.js
```

### 2. Iniciar o Sistema Automático

O sistema pode ser iniciado via API ou diretamente no código:

```javascript
const agendadorNotificacoes = require('./services/agendadorNotificacoes');

// Iniciar o sistema
agendadorNotificacoes.iniciar();

// Parar o sistema
agendadorNotificacoes.parar();
```

### 3. Endpoints da API

#### Status do Sistema
```
GET /api/notificacoes-automaticas/status
```

#### Controle do Sistema
```
POST /api/notificacoes-automaticas/iniciar
POST /api/notificacoes-automaticas/parar
POST /api/notificacoes-automaticas/verificar-manual
```

#### Testes de E-mail
```
POST /api/notificacoes-automaticas/testar/parabens
POST /api/notificacoes-automaticas/testar/boas-vindas
POST /api/notificacoes-automaticas/testar/vencimento-aluguel
POST /api/notificacoes-automaticas/testar/reajuste
POST /api/notificacoes-automaticas/testar/vencimento-contrato
```

## 📅 Agendamentos Automáticos

| Tipo | Horário | Frequência | Descrição |
|------|---------|------------|-----------|
| 🎂 Aniversários | 09:00 | Diário | Verifica aniversários do dia |
| 💰 Vencimentos | 08:00 | Diário | Verifica aluguéis vencendo |
| 🏠 Contratos | 10:00 | Segunda-feira | Verifica contratos vencendo |
| 📊 Relatório | 17:00 | Sexta-feira | Relatório semanal |

## 🎨 Templates de E-mail

### 🎂 Aniversário
- Design colorido com gradiente
- Personalização com nome e idade
- Mensagem calorosa da equipe

### 👋 Boas-vindas
- Layout profissional
- Diferenciação por tipo de usuário
- Links para acesso ao sistema

### 💰 Vencimento de Aluguel
- Cores baseadas na urgência
- Informações claras do pagamento
- Link direto para boletos

### 📈 Reajuste Anual
- Comparação visual de valores
- Percentual de reajuste destacado
- Informações legais

### 🏠 Vencimento de Contrato
- Alerta visual de urgência
- Informações do imóvel
- Botões de contato direto

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

```env
# E-mail (já configurado)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=imobfirenze@gmail.com
EMAIL_PASS=drcm oyug ctxg rsws
EMAIL_FROM_NAME=Imobiliária Firenze
EMAIL_FROM_EMAIL=imobfirenze@gmail.com

# Frontend (opcional)
FRONTEND_URL=http://localhost:3000
```

### Dependências

```json
{
  "node-cron": "^3.0.3",
  "nodemailer": "^7.0.3"
}
```

## 📊 Exemplos de Uso

### Enviar Parabéns Manualmente

```javascript
const notificacaoService = require('./services/notificacaoAutomaticaService');

const inquilino = {
  nome: 'Maria Silva',
  email: 'maria@email.com',
  idade: 30
};

await notificacaoService.enviarParabensAniversario(inquilino);
```

### Enviar Boas-vindas

```javascript
const usuario = {
  nome: 'João Santos',
  email: 'joao@email.com'
};

await notificacaoService.enviarBoasVindas(usuario, 'inquilino');
```

### Lembrete de Vencimento

```javascript
const contrato = {
  valorAluguel: 1500.00,
  dataVencimento: new Date('2024-01-15'),
  inquilino: {
    nome: 'Ana Costa',
    email: 'ana@email.com'
  }
};

await notificacaoService.enviarLembreteVencimentoAluguel(contrato);
```

## 🔍 Monitoramento

### Logs do Sistema

O sistema gera logs detalhados de todas as operações:

```
🚀 Iniciando agendador de notificações automáticas...
📅 Agendamento de aniversários configurado (9h diariamente)
📅 Agendamento de vencimentos configurado (8h diariamente)
✅ Agendador de notificações iniciado com sucesso!
```

### Status via API

```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "tarefasAgendadas": 4,
    "sistemaAtivo": true,
    "configuracoes": {
      "aniversarios": { "ativo": true, "horario": "09:00" },
      "vencimentosAluguel": { "ativo": true, "horario": "08:00" }
    }
  }
}
```

## 🛠️ Personalização

### Modificar Templates

Os templates estão em `services/notificacaoAutomaticaService.js`:

```javascript
const emailTemplates = {
  aniversario: (nome, idade) => ({
    subject: `🎂 Parabéns, ${nome}!`,
    html: `<!-- Seu HTML personalizado -->`
  })
};
```

### Alterar Horários

Modifique os horários em `services/agendadorNotificacoes.js`:

```javascript
// Formato: segundo minuto hora dia mês dia-da-semana
cron.schedule('0 9 * * *', callback); // 9h todos os dias
```

## 🚨 Troubleshooting

### Problema: E-mails não são enviados
- ✅ Verifique se o Gmail está configurado corretamente
- ✅ Confirme se a senha de aplicativo está ativa
- ✅ Verifique os logs do sistema

### Problema: Agendamentos não funcionam
- ✅ Certifique-se de que o sistema foi iniciado
- ✅ Verifique se o servidor está rodando continuamente
- ✅ Confirme o fuso horário (America/Sao_Paulo)

### Problema: Templates não aparecem corretamente
- ✅ Verifique se o cliente de e-mail suporta HTML
- ✅ Teste com diferentes clientes (Gmail, Outlook)

## 📈 Próximas Melhorias

- 📱 Notificações push para mobile
- 📊 Dashboard de estatísticas de e-mails
- 🎯 Segmentação avançada de usuários
- 📝 Editor visual de templates
- 🔄 Integração com WhatsApp

## 🎉 Conclusão

O Sistema de Notificações Automáticas está **100% funcional** e pronto para uso! 

### ✅ O que está funcionando:
- ✅ Envio de e-mails automáticos
- ✅ Templates profissionais e responsivos
- ✅ Agendamento automático
- ✅ API completa para controle
- ✅ Sistema de logs e monitoramento

### 🚀 Para começar:
1. Execute o teste: `node teste-notificacoes-automaticas.js`
2. Inicie o sistema: `agendadorNotificacoes.iniciar()`
3. Monitore via API: `GET /api/notificacoes-automaticas/status`

**Seu sistema de comunicação automatizada está pronto! 🎊**