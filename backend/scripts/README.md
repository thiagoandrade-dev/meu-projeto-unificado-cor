# Script de Migração para Cloudinary

Este diretório contém scripts para migrar imagens existentes do armazenamento local para o Cloudinary.

## migrate-images-to-cloudinary.js

Script que migra todas as imagens de imóveis do armazenamento local para o Cloudinary.

### Funcionalidades

- ✅ Busca todos os imóveis que possuem imagens locais
- ✅ Faz upload das imagens para o Cloudinary
- ✅ Gera URLs otimizadas (thumbnail, medium, large, webp)
- ✅ Atualiza os documentos no MongoDB com as novas URLs
- ✅ Preserva a foto principal de cada imóvel
- ✅ Log detalhado do processo de migração

### Pré-requisitos

1. Variáveis de ambiente configuradas no `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=seu_cloud_name
   CLOUDINARY_API_KEY=sua_api_key
   CLOUDINARY_API_SECRET=seu_api_secret
   MONGODB_URI=sua_string_conexao_mongodb
   ```

2. Dependências instaladas:
   ```bash
   npm install cloudinary mongoose dotenv
   ```

### Como usar

1. **Backup do banco de dados** (IMPORTANTE!):
   ```bash
   mongodump --uri="sua_string_conexao" --out=backup_antes_migracao
   ```

2. **Executar o script**:
   ```bash
   cd backend/scripts
   node migrate-images-to-cloudinary.js
   ```

3. **Verificar os logs** para confirmar que a migração foi bem-sucedida

### O que o script faz

1. **Conecta ao MongoDB** usando a string de conexão do `.env`
2. **Busca imóveis** que têm imagens locais mas ainda não foram migrados
3. **Para cada imóvel**:
   - Verifica se os arquivos de imagem existem no disco
   - Faz upload de cada imagem para o Cloudinary
   - Gera URLs otimizadas em diferentes tamanhos
   - Atualiza o documento no MongoDB com as novas URLs
4. **Relatório final** com número de sucessos e erros

### Estrutura dos dados após migração

Após a migração, cada imóvel terá:

```javascript
{
  // Dados originais mantidos
  imagens: ["imagem1.jpg", "imagem2.jpg"], // URLs locais (mantidas para compatibilidade)
  
  // Novos campos adicionados
  cloudinary_public_ids: ["imovel_123_0_1234567890", "imovel_123_1_1234567891"],
  imagens_cloudinary: {
    original: ["https://res.cloudinary.com/.../original1.jpg", "..."],
    thumbnail: ["https://res.cloudinary.com/.../thumb1.webp", "..."],
    medium: ["https://res.cloudinary.com/.../medium1.webp", "..."],
    large: ["https://res.cloudinary.com/.../large1.webp", "..."],
    webp: ["https://res.cloudinary.com/.../webp1.webp", "..."]
  },
  fotoPrincipal: "https://res.cloudinary.com/.../principal.jpg"
}
```

### Segurança

- ⚠️ **Sempre faça backup** do banco de dados antes de executar
- ⚠️ **Teste em ambiente de desenvolvimento** primeiro
- ✅ O script não remove as imagens locais automaticamente
- ✅ Mantém compatibilidade com URLs locais existentes

### Troubleshooting

**Erro de conexão com MongoDB:**
- Verifique a string de conexão no `.env`
- Confirme que o MongoDB está rodando

**Erro de autenticação Cloudinary:**
- Verifique as credenciais no `.env`
- Confirme que a conta Cloudinary está ativa

**Arquivos não encontrados:**
- O script pula arquivos que não existem no disco
- Verifique se o caminho `uploads/imoveis/` está correto

**Falha no upload:**
- Verifique a conexão com internet
- Confirme os limites da conta Cloudinary
- Verifique se o formato da imagem é suportado