const express = require('express');
const router = express.Router();
const FileSync = require('../utils/fileSync');
const verificarToken = require('../middlewares/authMiddleware');

// Middleware para verificar se é admin
const verificarAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.perfil === 'admin') {
    next();
  } else {
    return res.status(403).json({ erro: 'Acesso negado. Apenas administradores podem executar esta operação.' });
  }
};

/**
 * @swagger
 * /api/file-sync/status:
 *   get:
 *     summary: Verifica o status de integridade dos arquivos
 *     tags: [FileSync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status de integridade dos arquivos
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/status', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const fileSync = new FileSync();
    const report = await fileSync.generateIntegrityReport();
    
    res.json({
      sucesso: true,
      relatorio: report
    });
  } catch (error) {
    console.error('Erro ao verificar status de integridade:', error);
    res.status(500).json({
      erro: 'Erro interno ao verificar integridade dos arquivos',
      detalhes: error.message
    });
  }
});

/**
 * @swagger
 * /api/file-sync/check-orphans:
 *   get:
 *     summary: Verifica imagens órfãs sem removê-las
 *     tags: [FileSync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de imagens órfãs e referências quebradas
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/check-orphans', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const fileSync = new FileSync();
    const result = await fileSync.checkOrphanedImovelImages();
    
    res.json({
      sucesso: true,
      resultado: result
    });
  } catch (error) {
    console.error('Erro ao verificar imagens órfãs:', error);
    res.status(500).json({
      erro: 'Erro interno ao verificar imagens órfãs',
      detalhes: error.message
    });
  }
});

/**
 * @swagger
 * /api/file-sync/clean-orphans:
 *   post:
 *     summary: Remove imagens órfãs do sistema de arquivos
 *     tags: [FileSync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Imagens órfãs removidas com sucesso
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/clean-orphans', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const fileSync = new FileSync();
    const result = await fileSync.cleanOrphanedImovelImages();
    
    res.json({
      sucesso: true,
      mensagem: `${result.removidas} imagens órfãs removidas de ${result.total} encontradas`,
      resultado: result
    });
  } catch (error) {
    console.error('Erro ao limpar imagens órfãs:', error);
    res.status(500).json({
      erro: 'Erro interno ao limpar imagens órfãs',
      detalhes: error.message
    });
  }
});

/**
 * @swagger
 * /api/file-sync/fix-references:
 *   post:
 *     summary: Corrige referências quebradas no banco de dados
 *     tags: [FileSync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referências corrigidas com sucesso
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/fix-references', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const fileSync = new FileSync();
    const result = await fileSync.fixBrokenImageReferences();
    
    res.json({
      sucesso: true,
      mensagem: `${result.imoveisCorrigidos} imóveis corrigidos, ${result.imagensRemovidas} referências quebradas removidas`,
      resultado: result
    });
  } catch (error) {
    console.error('Erro ao corrigir referências:', error);
    res.status(500).json({
      erro: 'Erro interno ao corrigir referências quebradas',
      detalhes: error.message
    });
  }
});

/**
 * @swagger
 * /api/file-sync/sync-complete:
 *   post:
 *     summary: Executa sincronização completa (corrige referências + remove órfãs)
 *     tags: [FileSync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sincronização completa executada com sucesso
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/sync-complete', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const fileSync = new FileSync();
    const result = await fileSync.syncComplete();
    
    res.json({
      sucesso: true,
      mensagem: 'Sincronização completa executada com sucesso',
      resultado: result
    });
  } catch (error) {
    console.error('Erro na sincronização completa:', error);
    res.status(500).json({
      erro: 'Erro interno na sincronização completa',
      detalhes: error.message
    });
  }
});

module.exports = router;