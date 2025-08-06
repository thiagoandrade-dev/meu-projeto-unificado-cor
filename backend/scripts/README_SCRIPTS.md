# Scripts de Administração do Sistema

Este diretório contém scripts úteis para administração e manutenção do sistema.

## Scripts Disponíveis

### verificar_admin.js

Verifica o usuário administrador atual no sistema.

```bash
node scripts/verificar_admin.js
```

Este script mostra o nome, email e perfil do usuário administrador encontrado no banco de dados.

### verificar_usuario_especifico.js

Verifica informações de um usuário específico pelo email.

```bash
node scripts/verificar_usuario_especifico.js
```

Por padrão, este script verifica o usuário com email `admin@imobiliariafirenze.com.br`. Para verificar outro usuário, edite a variável `emailParaVerificar` no script.

### atualizar_senha_admin.js

Atualiza a senha do usuário administrador para `admin123`.

```bash
node scripts/atualizar_senha_admin.js
```

Este script é útil quando há problemas de login com o usuário administrador. Ele redefine a senha do usuário com email `admin@imobiliariafirenze.com.br` para `admin123`.

### criar_novo_admin.js

Cria um novo usuário administrador ou atualiza um usuário existente para ter perfil de administrador.

```bash
node scripts/criar_novo_admin.js
```

Este script verifica se o usuário com email `admin@imobiliariafirenze.com.br` já existe e, se necessário, cria um novo usuário administrador ou atualiza o perfil de um usuário existente para "admin".

## Observações Importantes

1. Todos os scripts devem ser executados a partir do diretório raiz do backend.
2. Certifique-se de que o arquivo `.env` está configurado corretamente com a string de conexão do MongoDB.
3. Estes scripts são ferramentas de administração e devem ser usados com cautela em ambientes de produção.