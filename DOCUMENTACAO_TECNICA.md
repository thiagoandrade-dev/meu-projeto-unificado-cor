# Documentação Técnica - Imobiliária Firenze

Este documento contém informações técnicas detalhadas sobre o sistema de gestão da Imobiliária Firenze, destinado a desenvolvedores e equipe técnica.

## Arquitetura do Sistema

O sistema segue uma arquitetura cliente-servidor com separação clara entre frontend e backend:

### Frontend
- **Framework**: React 18 com TypeScript
- **Gerenciamento de Estado**: Context API
- **Roteamento**: React Router v6
- **Estilização**: TailwindCSS com componentes personalizados
- **Formulários**: Validação com Zod
- **Requisições HTTP**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Banco de Dados**: MongoDB com Mongoose
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: Express Validator
- **Upload de Arquivos**: Multer
- **Integração de Pagamentos**: API Asaas

## Estrutura de Diretórios

### Frontend
```
frontend/
├── public/            # Arquivos estáticos
├── src/
│   ├── components/    # Componentes reutilizáveis
│   │   └── ui/        # Componentes de UI básicos
│   ├── contexts/      # Contextos React (AuthContext, etc.)
│   ├── hooks/         # Hooks personalizados
│   ├── pages/         # Componentes de página
│   │   ├── admin/     # Páginas administrativas
│   │   └── locatario/ # Páginas do locatário
│   ├── services/      # Serviços de API
│   ├── styles/        # Estilos globais
│   ├── types/         # Definições de tipos TypeScript
│   ├── utils/         # Funções utilitárias
│   ├── App.tsx        # Componente principal
│   ├── main.tsx       # Ponto de entrada
│   └── index.css      # Estilos globais
├── .env               # Variáveis de ambiente
├── package.json       # Dependências
├── tsconfig.json      # Configuração TypeScript
└── vite.config.ts     # Configuração Vite
```

### Backend
```
backend/
├── controllers/       # Controladores de rota
├── middlewares/       # Middlewares personalizados
├── models/            # Modelos Mongoose
├── routes/            # Definições de rota
├── services/          # Serviços de negócio
├── utils/             # Funções utilitárias
├── uploads/           # Diretório para uploads
├── .env               # Variáveis de ambiente
├── package.json       # Dependências
└── server.js          # Ponto de entrada
```

## Modelos de Dados

### Usuário
```javascript
{
  id: String,
  nome: String,
  email: String,
  senha: String (hash),
  telefone: String,
  perfil: Enum ['admin', 'inquilino', 'proprietario', 'corretor'],
  status: Enum ['ativo', 'inativo', 'pendente'],
  dataCadastro: Date,
  ultimoAcesso: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

### Imóvel
```javascript
{
  id: String,
  titulo: String,
  tipo: Enum ['Apartamento', 'Casa', 'Comercial', 'Terreno'],
  operacao: Enum ['Venda', 'Aluguel'],
  preco: Number,
  precoCondominio: Number,
  endereco: String,
  bairro: String,
  cidade: String,
  estado: String,
  areaUtil: Number,
  quartos: Number,
  suites: Number,
  banheiros: Number,
  vagas: Number,
  descricao: String,
  caracteristicas: [String],
  fotos: [String],
  destaque: Boolean,
  status: Enum ['Disponível', 'Ocupado', 'Reservado', 'Manutenção'],
  dataCadastro: Date
}
```

### Contrato
```javascript
{
  id: String,
  imovelId: String,
  inquilinoId: String,
  proprietarioId: String,
  dataInicio: Date,
  dataFim: Date,
  valorAluguel: Number,
  valorCondominio: Number,
  valorIPTU: Number,
  valorTotal: Number,
  diaVencimento: Number,
  status: Enum ['Ativo', 'Encerrado', 'Cancelado', 'Pendente'],
  observacoes: String,
  arquivos: [String],
  dataCadastro: Date
}
```

### Notificação
```javascript
{
  id: String,
  usuarioId: String,
  titulo: String,
  mensagem: String,
  tipo: Enum ['info', 'success', 'warning', 'error'],
  lida: Boolean,
  dataCriacao: Date
}
```

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/logout` - Logout de usuário
- `GET /api/auth/me` - Obter usuário atual

### Usuários
- `GET /api/usuarios` - Listar todos os usuários
- `GET /api/usuarios/:id` - Obter usuário por ID
- `POST /api/usuarios` - Criar novo usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Excluir usuário

### Imóveis
- `GET /api/imoveis` - Listar todos os imóveis
- `GET /api/imoveis/:id` - Obter imóvel por ID
- `POST /api/imoveis` - Criar novo imóvel
- `PUT /api/imoveis/:id` - Atualizar imóvel
- `DELETE /api/imoveis/:id` - Excluir imóvel
- `GET /api/imoveis/destaque` - Listar imóveis em destaque
- `GET /api/imoveis/busca` - Buscar imóveis com filtros

### Contratos
- `GET /api/contratos` - Listar todos os contratos
- `GET /api/contratos/:id` - Obter contrato por ID
- `POST /api/contratos` - Criar novo contrato
- `PUT /api/contratos/:id` - Atualizar contrato
- `DELETE /api/contratos/:id` - Excluir contrato
- `GET /api/contratos/usuario/:id` - Listar contratos por usuário

### Dashboard
- `GET /api/dashboard/resumo` - Obter resumo do dashboard
- `GET /api/dashboard/imoveis` - Obter estatísticas de imóveis
- `GET /api/dashboard/contratos` - Obter estatísticas de contratos
- `GET /api/dashboard/financeiro` - Obter estatísticas financeiras
- `GET /api/dashboard/usuarios` - Obter estatísticas de usuários

### Asaas
- `POST /api/asaas/cliente` - Criar cliente no Asaas
- `POST /api/asaas/cobranca` - Criar cobrança no Asaas
- `GET /api/asaas/boletos/:customerId` - Listar boletos por cliente
- `GET /api/asaas/pdf/:boletoId` - Baixar boleto em PDF

### Notificações
- `GET /api/notificacoes` - Listar notificações do usuário atual
- `PUT /api/notificacoes/:id` - Marcar notificação como lida
- `DELETE /api/notificacoes/:id` - Excluir notificação

## Autenticação e Autorização

O sistema utiliza JWT (JSON Web Tokens) para autenticação. O fluxo é o seguinte:

1. O usuário faz login com email e senha
2. O servidor valida as credenciais e gera um token JWT
3. O token é armazenado no localStorage do navegador
4. O token é enviado em todas as requisições subsequentes no header Authorization
5. O servidor valida o token em cada requisição protegida
6. Diferentes níveis de acesso são controlados pelo campo `perfil` do usuário

## Integração com Asaas

A integração com o Asaas é feita através da API REST oficial. O fluxo básico é:

1. Criar um cliente no Asaas quando um novo inquilino é registrado
2. Criar cobranças mensais para cada contrato ativo
3. Permitir que o inquilino visualize e pague seus boletos
4. Receber webhooks do Asaas para atualizar o status dos pagamentos

## Upload de Arquivos

O sistema utiliza Multer para gerenciar uploads de arquivos:

1. Imagens de imóveis são armazenadas em `/uploads/imoveis`
2. Documentos de contratos são armazenados em `/uploads/contratos`
3. Fotos de perfil são armazenadas em `/uploads/usuarios`

## Segurança

- Senhas são armazenadas com hash bcrypt
- Validação de entrada em todas as rotas
- Proteção contra CSRF
- Sanitização de dados
- Rate limiting para prevenir ataques de força bruta
- Middlewares de autenticação e autorização

## Considerações para Produção

- Configurar CORS adequadamente
- Utilizar HTTPS
- Implementar monitoramento e logging
- Configurar backups regulares do banco de dados
- Utilizar variáveis de ambiente para configurações sensíveis
- Implementar testes automatizados

## Próximos Desenvolvimentos

- Implementação de testes unitários e de integração
- Melhorias na integração com o Asaas
- Sistema de notificações em tempo real com WebSockets
- Aplicativo móvel com React Native
- Relatórios avançados com exportação para PDF
- Integração com Google Maps para visualização de imóveis

---

Última atualização: Junho de 2025

