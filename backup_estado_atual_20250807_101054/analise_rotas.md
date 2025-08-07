


## Análise de Rotas Frontend-Backend

### Rotas do Backend (Express.js)

As rotas do backend estão definidas na pasta `backend/routes/`.

- **`auth.js`**: Gerencia autenticação de usuários.
  - `POST /auth/register`: Registro de novos usuários.
  - `POST /auth/login`: Login de usuários.
  - `GET /auth/verify-token`: Verificação de token JWT.

- **`asaasRoutes.js`**: Integração com a API do Asaas.
  - `POST /api/asaas/cliente`: Criação de cliente no Asaas.
  - `POST /api/asaas/cobranca`: Criação de cobrança no Asaas.
  - `GET /api/asaas/boletos/:customerId`: Listagem de boletos de um cliente.
  - `GET /api/asaas/pdf/:boletoId`: Download de PDF de boleto.

- **`imovel.js`**: Gerencia imóveis.
  - `GET /imoveis`: Lista todos os imóveis.
  - `POST /imoveis`: Cria um novo imóvel (com upload de imagens).
  - `GET /imoveis/:id`: Busca um imóvel por ID.
  - `PUT /imoveis/:id`: Atualiza um imóvel por ID (com upload de imagens).
  - `DELETE /imoveis/:id`: Deleta um imóvel por ID.
  - `GET /imoveis/seed`: Rota para popular o banco de dados com imóveis de teste (apenas para desenvolvimento).

- **Outras rotas existentes (não detalhadas, mas presentes):**
  - `contato.js`
  - `contrato.js`
  - `dashboard.js`
  - `juridico.js`
  - `notificacao.routes.js`

### Rotas do Frontend (React/TypeScript)

As requisições do frontend são feitas principalmente através dos arquivos em `frontend/src/services/`.

- **`apiService.ts`**: Configuração base do Axios e definição de interfaces e serviços genéricos.
  - `imoveisService`: Utiliza as rotas `/imoveis` para operações CRUD de imóveis.
  - `authService`: Utiliza as rotas `/usuarios/login` e `/usuarios/registrar` (observado que o `userService` também lida com isso, o que pode gerar redundância ou confusão).
  - `asaasService`: Utiliza as rotas `/api/asaas/cliente`, `/api/asaas/cobranca`, `/api/asaas/boletos/:customerId` e `/api/asaas/pdf/:boletoId`.
  - `usuariosService`: Utiliza as rotas `/usuarios`, `/usuarios/:id` e `/usuarios/:id/status` para operações CRUD de usuários.

- **`userService.ts`**: Serviço dedicado a operações de usuário.
  - `login`: Faz `POST` para `/auth/login` (corrigido de `/api/auth/login`).
  - `register`: Faz `POST` para `/auth/register` (corrigido de `/api/auth/register`).
  - `getAll`, `getById`: Fazem `GET` para `/api/usuarios` e `/api/usuarios/:id` (endpoints de exemplo, precisam ser confirmados no backend).
  - `verifyToken`: Faz `GET` para `/auth/verify-token`.

### Inconsistências e Rotas Faltantes Identificadas

1.  **Inconsistência nas rotas Asaas**: O frontend (`asaasService.ts`) esperava `/api/asaas/cliente` e `/api/asaas/cobranca`, enquanto o backend (`asaasRoutes.js`) tinha `/asaas/clientes` e `/asaas/cobrancas`. **Corrigido no backend** para alinhar com o frontend.
2.  **Inconsistência nas rotas de Autenticação (`userService.ts`)**: O `userService.ts` no frontend estava chamando `/api/auth/login` e `/api/auth/register`, enquanto o `auth.js` no backend esperava `/auth/login` e `/auth/register`. **Corrigido no frontend** para alinhar com o backend.
3.  **Rotas de Usuários (CRUD)**: O `userService.ts` no frontend possui métodos `getAll`, `create`, `update`, `delete` e `updateStatus` para `/api/usuarios` e `/api/usuarios/:id`. No entanto, o backend (`auth.js`) atualmente só lida com `register` e `login` para `Inquilino` (que parece ser o modelo de usuário). **É necessário criar as rotas de CRUD para usuários no backend** (e possivelmente um novo modelo `User` ou estender `Inquilino` para incluir `admin` e outros perfis de forma mais robusta, se ainda não for o caso).

### Próximos Passos

- Implementar as rotas de CRUD para usuários no backend.
- Finalizar a integração do Asaas, garantindo que os `controllers` do Asaas no backend estejam completos e funcionais.
- Verificar e, se necessário, criar rotas para `contato`, `contrato`, `dashboard` e `juridico` no backend, e seus respectivos serviços no frontend, caso ainda não estejam totalmente implementados ou alinhados.

