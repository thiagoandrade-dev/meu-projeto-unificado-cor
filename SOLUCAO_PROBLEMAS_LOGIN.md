# Solução para Problemas de Login

## Problema Identificado

Foi identificado um problema no login do sistema. Os logs do servidor mostram que o usuário está tentando fazer login com o email `admin@imobiliariafirenze.com.br`, mas o usuário administrador criado pelo script é `admin@firenze.com`.

```
Tentativa de login recebida: admin@imobiliariafirenze.com.br
Usuário não encontrado: admin@imobiliariafirenze.com.br
```

## Soluções Possíveis

### 1. Usar o email correto para login

Para fazer login como administrador, use as seguintes credenciais:

- **Email**: `admin@firenze.com`
- **Senha**: `admin123`

### 2. Criar um novo usuário administrador com o email desejado

Se preferir usar o email `admin@imobiliariafirenze.com.br`, você pode modificar o script `criar_admin.js` e executá-lo novamente:

1. Abra o arquivo `backend/scripts/criar_admin.js`
2. Altere a linha 6 para:

```javascript
const adminData = {
  nome: "Administrador Firenze",
  email: "admin@imobiliariafirenze.com.br",
  senha: "admin123",
  perfil: "admin"
};
```

3. Execute o script novamente:

```
cd backend
node scripts/criar_admin.js
```

### 3. Verificar a configuração da URL da API no frontend

Certifique-se de que o frontend está apontando para a URL correta do backend:

- No arquivo `frontend/src/services/userService.ts`, a URL base está configurada para usar:
  1. Primeiro, a variável de ambiente `VITE_API_URL`
  2. Em produção, `https://imobiliaria-firenze-backend.onrender.com`
  3. Em desenvolvimento, `http://localhost:5000`

- Verifique se a rota de login está correta:
  - No `userService.ts`, a rota é `/api/auth/login`
  - No `apiService.ts`, a rota é `/usuarios/login`

## Verificação de Rotas

As rotas de autenticação no backend estão definidas em `backend/routes/auth.js` e são:

- `/api/auth/register` - Para registro de novos usuários
- `/api/auth/login` - Para login de usuários
- `/api/auth/verify-token` - Para verificação de token

## Logs e Depuração

Para depurar problemas de login, verifique:

1. Os logs do servidor backend para ver as tentativas de login
2. O console do navegador para ver erros de requisição
3. A resposta da API para entender o motivo da falha

## Recomendações

1. Padronize os emails usados no sistema
2. Documente as credenciais de acesso para testes
3. Implemente um sistema de recuperação de senha
4. Adicione mais logs para facilitar a depuração