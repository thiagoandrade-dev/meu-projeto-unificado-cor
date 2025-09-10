const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Schema do Imóvel (simplificado para migração)
const imovelSchema = new mongoose.Schema({
  imagens: [String],
  fotoPrincipal: String,
  cloudinary_public_ids: [String],
  imagens_cloudinary: {
    original: [String],
    thumbnail: [String],
    medium: [String],
    large: [String],
    webp: [String]
  }
}, { collection: 'imoveis' });

const Imovel = mongoose.model('Imovel', imovelSchema);

// Função para fazer upload de uma imagem para o Cloudinary
async function uploadImageToCloudinary(imagePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      public_id: publicId,
      folder: 'imoveis',
      resource_type: 'image',
      format: 'auto',
      quality: 'auto'
    });
    
    return {
      public_id: result.public_id,
      original: result.secure_url,
      thumbnail: cloudinary.url(result.public_id, {
        width: 300,
        height: 200,
        crop: 'fill',
        format: 'webp',
        quality: 'auto'
      }),
      medium: cloudinary.url(result.public_id, {
        width: 600,
        height: 400,
        crop: 'fill',
        format: 'webp',
        quality: 'auto'
      }),
      large: cloudinary.url(result.public_id, {
        width: 1200,
        height: 800,
        crop: 'fill',
        format: 'webp',
        quality: 'auto'
      }),
      webp: cloudinary.url(result.public_id, {
        format: 'webp',
        quality: 'auto'
      })
    };
  } catch (error) {
    console.error(`Erro ao fazer upload da imagem ${imagePath}:`, error);
    return null;
  }
}

// Função principal de migração
async function migrateImages() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imobiliaria');
    console.log('Conectado ao MongoDB');

    // Buscar todos os imóveis que têm imagens locais
    const imoveis = await Imovel.find({
      imagens: { $exists: true, $ne: [] },
      cloudinary_public_ids: { $exists: false }
    });

    console.log(`Encontrados ${imoveis.length} imóveis para migrar`);

    let sucessos = 0;
    let erros = 0;

    for (const imovel of imoveis) {
      console.log(`\nMigrando imóvel ID: ${imovel._id}`);
      
      const cloudinaryData = {
        public_ids: [],
        original: [],
        thumbnail: [],
        medium: [],
        large: [],
        webp: []
      };

      let fotoPrincipalCloudinary = null;

      for (let i = 0; i < imovel.imagens.length; i++) {
        const imagemLocal = imovel.imagens[i];
        const imagePath = path.join(__dirname, '../uploads/imoveis', imagemLocal);
        
        // Verificar se o arquivo existe
        if (!fs.existsSync(imagePath)) {
          console.log(`  ⚠️  Arquivo não encontrado: ${imagePath}`);
          continue;
        }

        // Gerar public_id único
        const publicId = `imovel_${imovel._id}_${i}_${Date.now()}`;
        
        console.log(`  📤 Fazendo upload: ${imagemLocal}`);
        const uploadResult = await uploadImageToCloudinary(imagePath, publicId);
        
        if (uploadResult) {
          cloudinaryData.public_ids.push(uploadResult.public_id);
          cloudinaryData.original.push(uploadResult.original);
          cloudinaryData.thumbnail.push(uploadResult.thumbnail);
          cloudinaryData.medium.push(uploadResult.medium);
          cloudinaryData.large.push(uploadResult.large);
          cloudinaryData.webp.push(uploadResult.webp);
          
          // Se for a primeira imagem ou a foto principal, definir como principal
          if (i === 0 || imagemLocal === imovel.fotoPrincipal) {
            fotoPrincipalCloudinary = uploadResult.original;
          }
          
          console.log(`  ✅ Upload concluído: ${uploadResult.public_id}`);
        } else {
          console.log(`  ❌ Falha no upload: ${imagemLocal}`);
        }
      }

      // Atualizar o documento no banco
      if (cloudinaryData.public_ids.length > 0) {
        await Imovel.findByIdAndUpdate(imovel._id, {
          cloudinary_public_ids: cloudinaryData.public_ids,
          imagens_cloudinary: {
            original: cloudinaryData.original,
            thumbnail: cloudinaryData.thumbnail,
            medium: cloudinaryData.medium,
            large: cloudinaryData.large,
            webp: cloudinaryData.webp
          },
          fotoPrincipal: fotoPrincipalCloudinary || cloudinaryData.original[0]
        });
        
        console.log(`  ✅ Imóvel atualizado no banco de dados`);
        sucessos++;
      } else {
        console.log(`  ❌ Nenhuma imagem foi migrada para este imóvel`);
        erros++;
      }
    }

    console.log(`\n🎉 Migração concluída!`);
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
}

// Executar migração
if (require.main === module) {
  console.log('🚀 Iniciando migração de imagens para Cloudinary...');
  migrateImages();
}

module.exports = { migrateImages };