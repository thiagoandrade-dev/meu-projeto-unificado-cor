const express = require('express');
const router = express.Router();
const Juridico = require('../models/Juridico');
const verificarToken = require('../middlewares/verificarToken');
const Multer = require('multer');
const path = require('path');
const { cloudinary } = require('../config/cloudinaryConfig');
const uploadMemory = Multer({ storage: Multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Descontinuado armazenamento local; usar memória + Cloudinary

// Listar todos os casos jurídicos
router.get('/', verificarToken, async (req, res) => {
  try {
    const casos = await Juridico.find()
      .populate('imovelId', 'grupo bloco andar apartamento')
      .populate('inquilinoId', 'nome email cpf')
      .populate('contratoId')
      .sort('-createdAt');
    
    res.json({ success: true, data: casos });
  } catch (error) {
    console.error('Erro ao buscar casos jurídicos:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar casos jurídicos', error: error.message });
  }
});

// Obter caso jurídico por ID
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const caso = await Juridico.findById(req.params.id)
      .populate('imovelId', 'grupo bloco andar apartamento')
      .populate('inquilinoId', 'nome email cpf')
      .populate('contratoId');
    
    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso jurídico não encontrado' });
    }
    
    res.json({ success: true, data: caso });
  } catch (error) {
    console.error('Erro ao buscar caso jurídico:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar caso jurídico', error: error.message });
  }
});

// Criar novo caso jurídico
router.post('/', verificarToken, async (req, res) => {
  try {
    const novoCaso = new Juridico(req.body);
    await novoCaso.save();
    
    res.status(201).json({ success: true, data: novoCaso, message: 'Caso jurídico criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar caso jurídico:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar caso jurídico', error: error.message });
  }
});

// Atualizar caso jurídico
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const caso = await Juridico.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso jurídico não encontrado' });
    }
    
    res.json({ success: true, data: caso, message: 'Caso jurídico atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar caso jurídico:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar caso jurídico', error: error.message });
  }
});

// Excluir caso jurídico
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const caso = await Juridico.findByIdAndDelete(req.params.id);
    
    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso jurídico não encontrado' });
    }
    
    // Se houver documentos, você pode querer removê-los também
    if (caso.documentos && caso.documentos.length > 0) {
      caso.documentos.forEach(doc => {
        const caminho = path.join(__dirname, '..', doc.caminho);
        if (fs.existsSync(caminho)) {
          fs.unlinkSync(caminho);
        }
      });
    }
    
    res.json({ success: true, message: 'Caso jurídico excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir caso jurídico:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir caso jurídico', error: error.message });
  }
});

// Upload de documentos para um caso jurídico
router.post('/:id/documentos', verificarToken, uploadMemory.array('documentos', 5), async (req, res) => {
  try {
    const caso = await Juridico.findById(req.params.id);
    
    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso jurídico não encontrado' });
    }
    
    const novosDocs = [];
    for (const file of (req.files || [])) {
      const timestamp = Date.now();
      const originalName = (file.originalname || 'documento').replace(/[^a-zA-Z0-9.-]/g, '_');
      const publicId = `juridico/${req.params.id}/${timestamp}_${originalName}`;
      const uploadRes = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: 'raw', public_id: publicId }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
        stream.end(file.buffer);
      });
      novosDocs.push({ nome: publicId, caminho: uploadRes.secure_url, dataUpload: new Date() });
    }
    
    caso.documentos = [...caso.documentos, ...novosDocs];
    await caso.save();
    
    res.json({ 
      success: true, 
      data: caso.documentos,
      message: 'Documentos adicionados com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao fazer upload de documentos:', error);
    res.status(500).json({ success: false, message: 'Erro ao fazer upload de documentos', error: error.message });
  }
});

// Excluir documento de um caso jurídico
router.delete('/:id/documentos/:docId', verificarToken, async (req, res) => {
  try {
    const caso = await Juridico.findById(req.params.id);
    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso jurídico não encontrado' });
    }
    const documento = caso.documentos.id(req.params.docId);
    if (!documento) {
      return res.status(404).json({ success: false, message: 'Documento não encontrado' });
    }
    if (/^https?:\/\//i.test(documento.caminho) && documento.nome) {
      try { await cloudinary.uploader.destroy(documento.nome, { resource_type: 'raw' }); } catch {}
    }
    await Juridico.updateOne({ _id: req.params.id }, { $pull: { documentos: { _id: req.params.docId } } });
    res.json({ success: true, message: 'Documento excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao excluir documento', error: error.message });
  }
});

module.exports = router;