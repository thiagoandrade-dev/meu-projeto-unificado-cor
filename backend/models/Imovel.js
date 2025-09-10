const mongoose = require('mongoose');

const ImovelSchema = new mongoose.Schema({
  grupo: {
    type: Number,
    required: [true, 'O campo GRUPO é obrigatório.'],
    min: [12, 'GRUPO deve ser no mínimo 12.'],
    max: [18, 'GRUPO deve ser no máximo 18.'],
  },
  bloco: {
    type: String,
    required: [true, 'O campo BLOCO é obrigatório.'],
    uppercase: true,
    enum: {
      values: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      message: 'BLOCO inválido.'
    }
    // Validação customizada para bloco vs grupo será feita na rota com express-validator
  },
  andar: {
    type: Number,
    required: [true, 'O campo ANDAR é obrigatório.'],
    // Validação customizada para andar vs grupo será feita na rota
  },
  apartamento: {
    type: Number,
    required: [true, 'O campo APARTAMENTO é obrigatório.'],
    // Validação customizada para apartamento vs andar/grupo será feita na rota
  },
  configuracaoPlanta: {
    type: String,
    required: [true, 'O campo CONFIGURACAO_PLANTA é obrigatório.'],
    enum: {
      values: [
        'Padrão (2 dorms)',
        '2 dorms + Despensa',
        '2 dorms + Dependência',
        'Padrão (3 dorms)',
        '3 dorms + Dependência',
      ],
      message: 'CONFIGURACAO_PLANTA inválida.'
    },
  },
  areaUtil: {
    type: Number,
    required: [true, 'O campo AREA_UTIL é obrigatório.'],
    // Validação do valor exato conforme configuracaoPlanta será feita na rota
  },
  numVagasGaragem: {
    type: Number,
    required: [true, 'O campo NUM_VAGAS_GARAGEM é obrigatório.'],
    min: [1, 'Deve haver no mínimo 1 vaga de garagem.'],
    max: [3, 'Deve haver no máximo 3 vagas de garagem.'],
  },
  tipoVagaGaragem: {
    type: String,
    required: [true, 'O campo TIPO_VAGA_GARAGEM é obrigatório.'],
    enum: {
      values: ['Coberta', 'Descoberta'], // Simplificado, lógica de "todas cobertas se >1" na rota
      message: 'TIPO_VAGA_GARAGEM inválido.'
    },
  },
  preco: {
    type: Number,
    required: [true, 'O campo PRECO é obrigatório.'],
    min: [0.01, 'PRECO deve ser maior que zero.'],
  },
  statusAnuncio: {
    type: String,
    required: [true, 'O campo STATUS_ANUNCIO é obrigatório.'],
    enum: {
      values: [
        'Disponível para Venda',
        'Disponível para Locação', 
        'Locado Ativo',
        'Vendido',
        'Reservado',
        'Indisponível',
        'Em Reforma'
      ],
      message: 'STATUS_ANUNCIO inválido.'
    },
  },
  imagens: {
    type: [{
      original: { type: String, required: true },
      thumbnail: { type: String },
      medium: { type: String },
      large: { type: String },
      webp: { type: String },
      orientation: {
        type: String,
        enum: ['landscape', 'portrait', 'square', 'unknown'],
        default: 'unknown'
      },
      dimensions: {
        width: { type: Number },
        height: { type: Number }
      }
    }],
    default: []
  },
  fotoPrincipal: {
    type: String,
    default: null // Índice da imagem principal no array imagens (0, 1, 2, etc.) ou null se não definida
  },
  dataStatusAtual: {
    type: Date,
    default: Date.now // Data em que o status atual foi definido
  },
  observacoesStatus: {
    type: String,
    default: '' // Observações sobre o status atual (motivo da indisponibilidade, detalhes da reforma, etc.)
  },
  contratoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contrato',
    default: null // Referência ao contrato ativo (se houver)
  },
  destaque: {
    type: Boolean,
    default: false // Define se o imóvel deve aparecer em destaque na página inicial
  },
  historico: {
    type: [{
      tipo: {
        type: String,
        required: true,
        enum: ['venda', 'reversao_venda', 'locacao_iniciada', 'locacao_finalizada', 'reforma', 'manutencao', 'status_alterado']
      },
      data: {
        type: Date,
        required: true
      },
      // Campos específicos para vendas
      comprador: {
        nome: String,
        cpf: String,
        email: String,
        telefone: String
      },
      valorVenda: Number,
      documentosEntregues: [String],
      // Campos gerais
      motivo: String,
      observacoes: String,
      statusAnterior: String,
      novoStatus: String,
      dataRegistro: {
        type: Date,
        default: Date.now
      },
      usuarioResponsavel: String
    }],
    default: []
  },
  // Campos de controle
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { 
  versionKey: false,
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// Middleware para validar Bloco vs Grupo (exemplo, idealmente na rota)
ImovelSchema.pre('save', function(next) {
  // Atualiza updatedAt
  this.updatedAt = Date.now();
  
  // Se o status foi modificado, atualiza a dataStatusAtual
  if (this.isModified('statusAnuncio')) {
    this.dataStatusAtual = Date.now();
  }
  
  const grupoPar = this.grupo % 2 === 0;
  if (grupoPar && ['G'].includes(this.bloco)) {
    return next(new Error('Bloco G não é permitido para grupos pares.'));
  }
  if (!grupoPar && !['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(this.bloco)) {
     // Esta validação já é coberta pelo enum, mas é um exemplo
  }
  // Validação de Andar vs Grupo
  if (grupoPar && (this.andar < 1 || this.andar > 28)) {
    return next(new Error(`Andar inválido para grupo par. Deve ser entre 1 e 28.`));
  }
  if (!grupoPar && (this.andar < 1 || this.andar > 36)) {
    return next(new Error(`Andar inválido para grupo ímpar. Deve ser entre 1 e 36.`));
  }
  
  // Validação de areaUtil vs configuracaoPlanta
  const areas = {
    'Padrão (2 dorms)': 82,
    '2 dorms + Despensa': 84,
    '2 dorms + Dependência': 86,
    'Padrão (3 dorms)': 125,
    '3 dorms + Dependência': 135,
  };
  if (this.areaUtil !== areas[this.configuracaoPlanta]) {
    return next(new Error(`Área útil (${this.areaUtil}m²) não corresponde à configuração de planta selecionada (${this.configuracaoPlanta} - ${areas[this.configuracaoPlanta]}m²).`));
  }

  // Validação tipoVagaGaragem vs numVagasGaragem
  if (this.numVagasGaragem > 1 && this.tipoVagaGaragem !== 'Coberta') {
      return next(new Error('Para mais de uma vaga, o tipo deve ser Coberta.'));
  }

  next();
});


module.exports = mongoose.models?.Imovel || mongoose.model('Imovel', ImovelSchema);
