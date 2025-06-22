# Instruções de Instalação e Execução

## Requisitos

- Node.js 16+ (recomendado 18+)
- MongoDB 4.4+
- NPM 7+

## Configuração do Backend

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do diretório backend
   - Adicione as seguintes variáveis:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/imobiliaria
     JWT_SECRET=sua_chave_secreta_jwt
     EMAIL_SERVICE=gmail
     EMAIL_USER=seu_email@gmail.com
     EMAIL_PASSWORD=sua_senha_ou_app_password
     EMAIL_FROM=noreply@imobiliariafirenze.com.br
     FRONTEND_URL=http://localhost:8080
     ASAAS_API_KEY=sua_chave_api_asaas
     ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

## Configuração do Frontend

1. Navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do diretório frontend
   - Adicione as seguintes variáveis:
     ```
     VITE_API_URL=http://localhost:5000/api
     ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Para build de produção:
   ```bash
   npm run build
   ```

## Acesso ao Sistema

- Frontend: http://localhost:8080
- Backend API: http://localhost:5000/api

## Usuário Administrador Padrão

Para criar um usuário administrador inicial, você pode usar a seguinte requisição:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"nome":"Admin","email":"admin@imobiliariafirenze.com.br","senha":"123456","perfil":"admin"}' http://localhost:5000/api/auth/register
```

## Configuração do Asaas

Para integração completa com o Asaas:

1. Crie uma conta no [Asaas](https://www.asaas.com/)
2. Obtenha sua chave de API no painel do Asaas
3. Configure a chave no arquivo `.env` do backend

## Solução de Problemas

### Erro de conexão com MongoDB
- Verifique se o MongoDB está em execução
- Confirme se a string de conexão está correta no arquivo `.env`

### Erro de CORS
- Verifique se o frontend está acessando a URL correta da API
- Confirme se o backend está configurado para permitir requisições do frontend

### Erro de autenticação
- Verifique se o JWT_SECRET está configurado corretamente
- Confirme se o token está sendo enviado nos cabeçalhos das requisições

### Erro no envio de emails
- Verifique as configurações de email no arquivo `.env`
- Para Gmail, pode ser necessário configurar uma "senha de aplicativo"

