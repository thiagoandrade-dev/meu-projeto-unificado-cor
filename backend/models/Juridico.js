const mongoose = require('mongoose');

const juridicoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Um título é obrigatório']
  },
  descricao: {
    type: String,
    required: [true, 'Uma descrição é obrigatória']
  },
  tipoAcao: {
    type: String,
    required: [true, 'O tipo de ação é obrigatório'],
    enum: [
      'Ação de Despejo', 
      'Cobrança', 
      'Renovatória', 
      'Revisional', 
      'Consignação em Pagamento', 
      'Condomínio',
      'Outros'
    ]
  },
  status: {
    type: String,
    required: [true, 'O status é obrigatório'],
    enum: ['Em andamento', 'Concluído', 'Arquivado'],
    default: 'Em andamento'
  },
  dataAbertura: {
    type: Date,
    required: [true, 'A data de abertura é obrigatória'],
    default: Date.now
  },
  dataFechamento: {
    type: Date
  },
  responsavel: {
    type: String,
    required: [true, 'O nome do responsável é obrigatório']
  },
  proximaAudiencia: {
    type: Date
  },
  observacoes: {
    type: String
  },
  // Relacionamentos
  imovelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Imovel'
  },
  inquilinoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquilino'
  },
  contratoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contrato'
  },
  // Arquivos/Documentos
  documentos: [{
    nome: String,
    caminho: String,
    dataUpload: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar a data de atualização
juridicoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Juridico = mongoose.model('Juridico', juridicoSchema);

module.exports = Juridico;