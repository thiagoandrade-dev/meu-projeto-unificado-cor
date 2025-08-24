const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Configurações para processamento de imagens
 */
const IMAGE_CONFIG = {
  // Tamanhos padrão para diferentes usos
  sizes: {
    thumbnail: { width: 300, height: 300 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 },
    gallery: { width: 1600, height: 1200 }
  },
  // Qualidade de compressão
  quality: {
    jpeg: 85,
    webp: 80
  },
  // Formatos suportados
  formats: ['jpeg', 'jpg', 'png', 'webp'],
  // Tamanho máximo do arquivo (10MB)
  maxFileSize: 10 * 1024 * 1024
};

/**
 * Detecta a orientação da imagem
 * @param {string} imagePath - Caminho para a imagem
 * @returns {Promise<{width: number, height: number, orientation: string}>}
 */
async function detectImageOrientation(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    const { width, height } = metadata;
    
    let orientation;
    if (width > height) {
      orientation = 'landscape';
    } else if (height > width) {
      orientation = 'portrait';
    } else {
      orientation = 'square';
    }
    
    return { width, height, orientation };
  } catch (error) {
    throw new Error(`Erro ao detectar orientação da imagem: ${error.message}`);
  }
}

/**
 * Redimensiona imagem mantendo proporção e orientação
 * @param {string} inputPath - Caminho da imagem original
 * @param {string} outputPath - Caminho da imagem processada
 * @param {string} size - Tamanho desejado (thumbnail, medium, large, gallery)
 * @param {string} format - Formato de saída (jpeg, webp)
 * @returns {Promise<{path: string, width: number, height: number, size: number}>}
 */
async function resizeImage(inputPath, outputPath, size = 'medium', format = 'jpeg') {
  try {
    const sizeConfig = IMAGE_CONFIG.sizes[size];
    if (!sizeConfig) {
      throw new Error(`Tamanho '${size}' não suportado`);
    }
    
    // Detectar orientação original
    const { orientation } = await detectImageOrientation(inputPath);
    
    let resizeOptions;
    
    // Ajustar dimensões baseado na orientação
    if (orientation === 'portrait') {
      // Para imagens portrait, usar altura como referência
      resizeOptions = {
        height: sizeConfig.height,
        width: null,
        fit: 'inside',
        withoutEnlargement: true
      };
    } else if (orientation === 'landscape') {
      // Para imagens landscape, usar largura como referência
      resizeOptions = {
        width: sizeConfig.width,
        height: null,
        fit: 'inside',
        withoutEnlargement: true
      };
    } else {
      // Para imagens quadradas, usar o menor valor
      const minSize = Math.min(sizeConfig.width, sizeConfig.height);
      resizeOptions = {
        width: minSize,
        height: minSize,
        fit: 'cover',
        position: 'center'
      };
    }
    
    let sharpInstance = sharp(inputPath)
      .resize(resizeOptions)
      .rotate(); // Auto-rotacionar baseado nos metadados EXIF
    
    // Aplicar formato e qualidade
    if (format === 'jpeg' || format === 'jpg') {
      sharpInstance = sharpInstance.jpeg({ 
        quality: IMAGE_CONFIG.quality.jpeg,
        progressive: true
      });
    } else if (format === 'webp') {
      sharpInstance = sharpInstance.webp({ 
        quality: IMAGE_CONFIG.quality.webp
      });
    } else if (format === 'png') {
      sharpInstance = sharpInstance.png({ 
        compressionLevel: 8
      });
    }
    
    // Processar e salvar
    const info = await sharpInstance.toFile(outputPath);
    
    // Obter tamanho do arquivo
    const stats = await fs.stat(outputPath);
    
    return {
      path: outputPath,
      width: info.width,
      height: info.height,
      size: stats.size,
      format: info.format
    };
  } catch (error) {
    throw new Error(`Erro ao redimensionar imagem: ${error.message}`);
  }
}

/**
 * Processa uma imagem criando múltiplas versões
 * @param {string} inputPath - Caminho da imagem original
 * @param {string} outputDir - Diretório de saída
 * @param {string} filename - Nome base do arquivo
 * @returns {Promise<Object>} Informações das imagens processadas
 */
async function processImage(inputPath, outputDir, filename) {
  try {
    // Verificar se o arquivo existe
    await fs.access(inputPath);
    
    // Detectar orientação original
    const originalInfo = await detectImageOrientation(inputPath);
    
    // Criar diretório de saída se não existir
    await fs.mkdir(outputDir, { recursive: true });
    
    const baseName = path.parse(filename).name;
    const results = {
      original: originalInfo,
      processed: {}
    };
    
    // Processar diferentes tamanhos
    const sizes = ['thumbnail', 'medium', 'large'];
    
    for (const size of sizes) {
      const outputFilename = `${baseName}_${size}.jpg`;
      const outputPath = path.join(outputDir, outputFilename);
      
      const processedInfo = await resizeImage(inputPath, outputPath, size, 'jpeg');
      results.processed[size] = {
        ...processedInfo,
        filename: outputFilename
      };
    }
    
    // Criar versão WebP para melhor compressão (opcional)
    const webpFilename = `${baseName}_medium.webp`;
    const webpPath = path.join(outputDir, webpFilename);
    const webpInfo = await resizeImage(inputPath, webpPath, 'medium', 'webp');
    results.processed.webp = {
      ...webpInfo,
      filename: webpFilename
    };
    
    return results;
  } catch (error) {
    throw new Error(`Erro ao processar imagem: ${error.message}`);
  }
}

/**
 * Valida se o arquivo é uma imagem válida
 * @param {string} filePath - Caminho do arquivo
 * @returns {Promise<boolean>}
 */
async function validateImage(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    return metadata.width > 0 && metadata.height > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Otimiza imagem existente sem redimensionar
 * @param {string} inputPath - Caminho da imagem
 * @param {string} outputPath - Caminho de saída
 * @param {number} quality - Qualidade (1-100)
 * @returns {Promise<Object>}
 */
async function optimizeImage(inputPath, outputPath, quality = 85) {
  try {
    const info = await sharp(inputPath)
      .jpeg({ quality, progressive: true })
      .toFile(outputPath);
    
    const stats = await fs.stat(outputPath);
    
    return {
      path: outputPath,
      width: info.width,
      height: info.height,
      size: stats.size,
      format: info.format
    };
  } catch (error) {
    throw new Error(`Erro ao otimizar imagem: ${error.message}`);
  }
}

module.exports = {
  detectImageOrientation,
  resizeImage,
  processImage,
  validateImage,
  optimizeImage,
  IMAGE_CONFIG
};