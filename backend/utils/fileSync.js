const fs = require('fs');
const path = require('path');
const Imovel = require('../models/Imovel');
const Contrato = require('../models/Contrato');
const Juridico = require('../models/Juridico');

/**
 * Utilitário para sincronização entre banco de dados e arquivos físicos
 */
class FileSync {
  constructor() {
    this.uploadsPath = path.join(__dirname, '..', 'uploads');
    this.imoveisPath = path.join(this.uploadsPath, 'imoveis');
    this.contratosPath = path.join(this.uploadsPath, 'contratos');
    this.juridicoPath = path.join(this.uploadsPath, 'juridico');
  }

  isUrl(str) {
    return typeof str === 'string' && /^https?:\/\//i.test(str);
  }

  extractLocalFileName(imageEntry) {
    if (typeof imageEntry === 'string') {
      if (this.isUrl(imageEntry)) return null;
      return path.basename(imageEntry);
    }
    if (imageEntry && typeof imageEntry === 'object') {
      const candidates = [imageEntry.original, imageEntry.thumbnail, imageEntry.medium, imageEntry.large, imageEntry.webp];
      for (const c of candidates) {
        if (typeof c === 'string' && !this.isUrl(c)) {
          return path.basename(c);
        }
      }
      return null;
    }
    return null;
  }

  /**
   * Verifica se um arquivo existe fisicamente
   */
  fileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      console.error(`Erro ao verificar arquivo ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Remove arquivo físico com segurança
   */
  removeFile(filePath) {
    try {
      if (this.fileExists(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Arquivo removido: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Erro ao remover arquivo ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Lista todos os arquivos em um diretório
   */
  listFiles(directory) {
    try {
      if (!fs.existsSync(directory)) {
        return [];
      }
      return fs.readdirSync(directory).filter(file => {
        const filePath = path.join(directory, file);
        return fs.statSync(filePath).isFile();
      });
    } catch (error) {
      console.error(`Erro ao listar arquivos em ${directory}:`, error);
      return [];
    }
  }

  /**
   * Verifica imagens órfãs de imóveis
   */
  async checkOrphanedImovelImages() {
    try {
      console.log('🔍 Verificando imagens órfãs de imóveis...');
      
      // Buscar todas as imagens no banco de dados
      const imoveis = await Imovel.find({}, 'imagens');
      const imagensNoBanco = new Set();
      
      imoveis.forEach(imovel => {
        if (imovel.imagens && Array.isArray(imovel.imagens)) {
          imovel.imagens.forEach(imagem => {
            const fileName = this.extractLocalFileName(imagem);
            if (fileName) imagensNoBanco.add(fileName);
          });
        }
      });

      // Listar arquivos físicos
      const arquivosFisicos = this.listFiles(this.imoveisPath);
      
      // Encontrar órfãs
      const imagensOrfas = arquivosFisicos.filter(arquivo => {
        return !imagensNoBanco.has(arquivo);
      });

      // Encontrar referências quebradas
      const referenciasBroken = [];
      for (const fileName of imagensNoBanco) {
        const filePath = path.join(this.imoveisPath, fileName);
        if (!this.fileExists(filePath)) {
          referenciasBroken.push(fileName);
        }
      }

      return {
        imagensOrfas,
        referenciasBroken,
        totalImagensNoBanco: imagensNoBanco.size,
        totalArquivosFisicos: arquivosFisicos.length
      };
    } catch (error) {
      console.error('Erro ao verificar imagens órfãs:', error);
      throw error;
    }
  }

  /**
   * Remove imagens órfãs de imóveis
   */
  async cleanOrphanedImovelImages() {
    try {
      const { imagensOrfas } = await this.checkOrphanedImovelImages();
      
      let removidas = 0;
      for (const imagem of imagensOrfas) {
        const filePath = path.join(this.imoveisPath, imagem);
        if (this.removeFile(filePath)) {
          removidas++;
        }
      }

      console.log(`✅ ${removidas} imagens órfãs removidas de imóveis`);
      return { removidas, total: imagensOrfas.length };
    } catch (error) {
      console.error('Erro ao limpar imagens órfãs:', error);
      throw error;
    }
  }

  /**
   * Corrige referências quebradas no banco de dados
   */
  async fixBrokenImageReferences() {
    try {
      console.log('🔧 Corrigindo referências quebradas...');
      
      const imoveis = await Imovel.find({});
      let imoveisCorrigidos = 0;
      let imagensRemovidas = 0;

      for (const imovel of imoveis) {
        if (imovel.imagens && Array.isArray(imovel.imagens)) {
          const imagensValidas = imovel.imagens.filter(imagem => {
            if (typeof imagem === 'string') {
              if (this.isUrl(imagem)) return true;
              const fileName = path.basename(imagem);
              const filePath = path.join(this.imoveisPath, fileName);
              return this.fileExists(filePath);
            }
            if (imagem && typeof imagem === 'object') {
              // Preservar objetos (p.ex. Cloudinary)
              return true;
            }
            return false;
          });

          if (imagensValidas.length !== imovel.imagens.length) {
            imagensRemovidas += imovel.imagens.length - imagensValidas.length;
            imovel.imagens = imagensValidas;

            if (typeof imovel.fotoPrincipal === 'number' && imovel.fotoPrincipal >= imagensValidas.length) {
              imovel.fotoPrincipal = imagensValidas.length > 0 ? 0 : undefined;
            }

            await imovel.save();
            imoveisCorrigidos++;
          }
        }
      }

      console.log(`✅ ${imoveisCorrigidos} imóveis corrigidos, ${imagensRemovidas} referências quebradas removidas`);
      return { imoveisCorrigidos, imagensRemovidas };
    } catch (error) {
      console.error('Erro ao corrigir referências quebradas:', error);
      throw error;
    }
  }

  /**
   * Executa sincronização completa
   */
  async syncComplete() {
    try {
      console.log('🚀 Iniciando sincronização completa...');
      
      // 1. Verificar estado atual
      const status = await this.checkOrphanedImovelImages();
      console.log('📊 Status atual:', {
        imagensOrfas: status.imagensOrfas.length,
        referenciasBroken: status.referenciasBroken.length,
        totalImagensNoBanco: status.totalImagensNoBanco,
        totalArquivosFisicos: status.totalArquivosFisicos
      });

      // 2. Corrigir referências quebradas
      const fixResult = await this.fixBrokenImageReferences();
      
      // 3. Limpar imagens órfãs
      const cleanResult = await this.cleanOrphanedImovelImages();
      
      // 4. Verificar estado final
      const finalStatus = await this.checkOrphanedImovelImages();
      
      const result = {
        inicial: status,
        correcoes: fixResult,
        limpeza: cleanResult,
        final: finalStatus
      };

      console.log('✨ Sincronização completa finalizada!');
      return result;
    } catch (error) {
      console.error('Erro na sincronização completa:', error);
      throw error;
    }
  }

  /**
   * Gera relatório de integridade
   */
  async generateIntegrityReport() {
    try {
      const imovelStatus = await this.checkOrphanedImovelImages();
      
      const report = {
        timestamp: new Date().toISOString(),
        imoveis: {
          imagensOrfas: imovelStatus.imagensOrfas.length,
          referenciasBroken: imovelStatus.referenciasBroken.length,
          totalImagensNoBanco: imovelStatus.totalImagensNoBanco,
          totalArquivosFisicos: imovelStatus.totalArquivosFisicos,
          integridade: {
          percentual: imovelStatus.referenciasBroken.length === 0 && imovelStatus.imagensOrfas.length === 0 ? 100 : 
                     imovelStatus.totalImagensNoBanco > 0 ? Math.round(((imovelStatus.totalImagensNoBanco - imovelStatus.referenciasBroken.length) / 
                     imovelStatus.totalImagensNoBanco) * 100) : 100,
          status: imovelStatus.referenciasBroken.length === 0 && imovelStatus.imagensOrfas.length === 0 ? 'OK' : 'PROBLEMAS'
        }
        }
      };

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório de integridade:', error);
      throw error;
    }
  }
}

module.exports = FileSync;