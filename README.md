# Imobiliária Firenze - Sistema de Gestão

Este projeto é um sistema completo de gestão para a Imobiliária Firenze, com funcionalidades para administração de imóveis, contratos, usuários e relatórios.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **Frontend**: Desenvolvido com React, TypeScript e TailwindCSS
- **Backend**: Desenvolvido com Node.js, Express e MongoDB

## Funcionalidades Implementadas

### Área Administrativa
- Dashboard com relatórios e métricas
- Gestão completa de usuários (administradores, inquilinos, proprietários, corretores)
- Gestão completa de imóveis (cadastro, edição, exclusão, visualização)
- Gestão de contratos
- Integração com Asaas para pagamentos

### Área Pública
- Página inicial com imóveis em destaque
- Listagem de imóveis com filtros
- Página de detalhes do imóvel
- Páginas institucionais (Sobre, Contato)
- Sistema de login e registro

## Requisitos

- Node.js 14+
- MongoDB
- NPM ou Yarn

## Instalação

### Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta backend com as seguintes variáveis:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/imobiliaria
JWT_SECRET=sua_chave_secreta
ASAAS_API_KEY=sua_chave_api_asaas
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_email
```

### Frontend

```bash
cd frontend
npm install
```

## Executando o Projeto

### Backend

```bash
cd backend
npm start
```

O servidor backend será iniciado na porta 5000.

### Frontend

```bash
cd frontend
npm run dev
```

O servidor de desenvolvimento do frontend será iniciado na porta 8080.

## Melhorias Implementadas

### Design e UX
- Tema consistente com as cores da Imobiliária Firenze
- Interface responsiva para desktop e dispositivos móveis
- Componentes reutilizáveis para consistência visual
- Feedback visual para ações do usuário

### Dashboard
- Relatórios de desempenho em tempo real
- Gráficos interativos para visualização de dados
- Métricas de negócio personalizadas
- Filtros avançados para análise de dados

### Funcionalidades Administrativas
- Sistema completo de CRUD para usuários
- Sistema completo de CRUD para imóveis
- Gestão de contratos com status e alertas
- Exportação de dados em formato CSV
- Upload e gerenciamento de múltiplas imagens

### Segurança
- Autenticação JWT
- Proteção de rotas por perfil de usuário
- Validação de formulários no frontend e backend
- Sanitização de dados

## Usuários de Teste

### Administrador
- Email: admin@teste.com
- Senha: 123456

### Inquilino
- Email: inquilino@teste.com
- Senha: 123456

## Próximos Passos

- Implementação de testes automatizados
- Melhorias na integração com o Asaas
- Implementação de notificações por email e push
- Desenvolvimento de aplicativo móvel

## Contato

Para mais informações ou suporte, entre em contato com a equipe de desenvolvimento.

---

Desenvolvido com ❤️ para a Imobiliária Firenze

