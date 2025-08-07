# Instruções para Acesso à Área Administrativa

## Credenciais de Administrador

Para acessar a área administrativa do sistema, você pode utilizar qualquer uma das seguintes credenciais:

**Opção 1:**
- **Email**: `admin@imobiliariafirenze.com.br`
- **Senha**: `admin123`

**Opção 2:**
- **Email**: `thiago@email.com`
- **Senha**: `admin123`

## Como Acessar a Área Administrativa

1. Acesse a página inicial do sistema
2. Clique no botão "Entrar" no canto superior direito da tela
3. Na página de login, insira as credenciais de administrador listadas acima
4. Após o login bem-sucedido, você será redirecionado automaticamente para a área administrativa

## Alternando entre Áreas

Se você já está logado como administrador e está na página inicial:

1. Clique no botão "Área Admin" na barra de navegação para acessar a área administrativa

## Saindo do Sistema (Logout)

Para sair do sistema:

1. Clique no botão "Sair" na barra de navegação
2. Você será desconectado e redirecionado para a página inicial

## Problemas Comuns

### Não consigo fazer login como administrador

Verifique se:

1. Está utilizando um dos emails corretos: 
   - `admin@imobiliariafirenze.com.br` ou
   - `thiago@email.com`
2. A senha está correta: `admin123` (mesma senha para ambos os usuários)
3. O backend está em execução (verifique os logs do servidor)

**Nota importante**: Se você estava enfrentando problemas de login com a mensagem "Senha incorreta" ou "Credenciais inválidas", este problema foi resolvido. As senhas dos administradores foram redefinidas para `admin123` em 05/08/2025.

### Não vejo o botão "Área Admin" após o login

Isso pode ocorrer se:

1. Você não está logado como um usuário com perfil "admin"
2. Houve um problema na autenticação

Tente fazer logout e login novamente com as credenciais de administrador.

## Criação de Novos Administradores

Se precisar criar um novo administrador, você pode:

1. Acessar a área administrativa com as credenciais existentes
2. Navegar até a seção de "Usuários"
3. Criar um novo usuário com perfil "admin"

Ou, alternativamente, executar o script de criação de administrador:

```
cd backend
node scripts/criar_novo_admin.js
```

## Solução de Problemas de Senha

Se você precisar redefinir as senhas dos administradores novamente, foi criado um script específico para isso:

```
cd backend
node scripts/atualizar_senha_admin.js
```

Este script redefine as senhas dos usuários `admin@imobiliariafirenze.com.br` e `thiago@email.com` para `admin123`.

## Suporte

Se continuar enfrentando problemas de acesso, verifique os logs do servidor para identificar possíveis erros de autenticação ou autorização.