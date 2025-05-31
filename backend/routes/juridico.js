const express = require('express');
const router = express.Router();
const Juridico = require('../models/Juridico');
const auth = require('./auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração de upload para documentos jurídicos
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = './uploads/juridico';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, `doc-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Listar todos os casos jurídicos
router.get('/', auth, async (req, res) => {
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
router.get('/:id', auth, async (req, res) => {
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
router.post('/', auth, async (req, res) => {
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
router.put('/:id', auth, async (req, res) => {
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
router.delete('/:id', auth, async (req, res) => {
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
router.post('/:id/documentos', auth, upload.array('documentos', 5), async (req, res) => {
  try {
    const caso = await Juridico.findById(req.params.id);
    
    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso jurídico não encontrado' });
    }
    
    const novosDocs = req.files.map(file => ({
      nome: file.originalname,
      caminho: file.path,
      dataUpload: new Date()
    }));
    
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
router.delete('/:id/documentos/:docId', auth, async (req, res) => {
  try {
    const caso = await Juridico.findById(req.params.id);
    
    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso jurídico não encontrado' });
    }
    
    const documento = caso.documentos.id(req.params.docId);
    
    if (!documento) {
      return res.status(404).json({ success: false, message: 'Documento não encontrado' });
    }
    
    // Remover o arquivo físico
    const caminho = path.join(__dirname, '..', documento.caminho);
    if (fs.existsSync(caminho)) {
      fs.unlinkSync(caminho);
    }
    
    // Remover da lista de documentos
    documento.remove();
    await caso.save();
    
    res.json({ 
      success: true, 
      message: 'Documento excluído com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir documento', error: error.message });
  }
});

module.exports = router;