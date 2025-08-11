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
  valorCondominio: {
    type: Number,
    default: 0,
    min: [0, 'O valor deve ser positivo']
  },
  valorIPTU: {
    type: Number,
    default: 0,
    min: [0, 'O valor deve ser positivo']
  },
  diaVencimento: {
    type: Number,
    required: [true, 'O dia de vencimento é obrigatório'],
    min: [1, 'Dia deve ser entre 1 e 31'],
    max: [31, 'Dia deve ser entre 1 e 31'],
    default: 10
  },
  proximoVencimento: {
    type: Date,
    required: false // Será calculado automaticamente
  },
  dataUltimoReajuste: {
    type: Date,
    default: function() { return this.dataInicio; }
  },
  percentualReajusteAnual: {
    type: Number,
    default: 0,
    min: [0, 'Percentual deve ser positivo']
  },
  indiceReajuste: {
    type: String,
    enum: ['IGPM', 'IPCA', 'INPC', 'Fixo', 'Outro'],
    default: 'IGPM'
  },
  observacoes: {
    type: String,
    trim: true
  },
  arquivoContrato: {
    type: String, // URL ou caminho do arquivo
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

// Método para calcular próximo vencimento
ContratoSchema.methods.calcularProximoVencimento = function() {
  const hoje = new Date();
  const proximoVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), this.diaVencimento);
  
  // Se o dia já passou neste mês, vai para o próximo mês
  if (proximoVencimento <= hoje) {
    proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
  }
  
  this.proximoVencimento = proximoVencimento;
  return proximoVencimento;
};

// Método para verificar se precisa de reajuste
ContratoSchema.methods.precisaReajuste = function() {
  if (!this.dataUltimoReajuste) return false;
  
  const hoje = new Date();
  const ultimoReajuste = new Date(this.dataUltimoReajuste);
  const diferencaAnos = hoje.getFullYear() - ultimoReajuste.getFullYear();
  
  return diferencaAnos >= 1;
};

// Middleware para calcular próximo vencimento antes de salvar
ContratoSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('diaVencimento')) {
    this.calcularProximoVencimento();
  }
  next();
});

module.exports = mongoose.models?.Contrato || mongoose.model('Contrato', ContratoSchema);