const mongoose = require('mongoose');

const ContratoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'O código do contrato é obrigatório'],
    unique: true,
    trim: true
  },
  inquilinoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquilino',
    required: [true, 'O inquilino é obrigatório']
  },
  imovelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Imovel',
    required: [true, 'O imóvel é obrigatório']
  },
  tipo: {
    type: String,
    enum: ['Locação', 'Venda'],
    required: [true, 'O tipo de contrato é obrigatório']
  },
  status: {
    type: String,
    enum: ['Ativo', 'Pendente', 'Vencido', 'Rescindido', 'Finalizado'],
    default: 'Pendente'
  },
  dataInicio: {
    type: Date,
    required: [true, 'A data de início é obrigatória']
  },
  dataFim: {
    type: Date,
    required: [true, 'A data de término é obrigatória']
  },
  duracaoMeses: {
    type: Number,
    required: [true, 'A duração em meses é obrigatória'],
    min: [1, 'A duração mínima é de 1 mês']
  },
  valorAluguel: {
    type: Number,
    required: [true, 'O valor do aluguel/venda é obrigatório'],
    min: [0, 'O valor deve ser positivo']
  },
  observacoes: {
    type: String,
    trim: true
  },
  dataRescisao: {
    type: Date
  },
  motivoRescisao: {
    type: String,
    trim: true
  },
  ajustes: [{
    data: Date,
    tipo: {
      type: String,
      enum: ['Reajuste', 'Desconto', 'Multa', 'Outro']
    },
    valorAnterior: Number,
    novoValor: Number,
    motivo: String
  }],
  // Campos de controle
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.models?.Contrato || mongoose.model('Contrato', ContratoSchema);