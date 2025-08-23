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

// Middleware para calcular próximo vencimento e atualizar status do imóvel
ContratoSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('diaVencimento')) {
    this.calcularProximoVencimento();
  }
  
  // Se o status do contrato foi modificado, atualizar o status do imóvel
  if (this.isModified('status') || this.isNew) {
    try {
      const Imovel = mongoose.model('Imovel');
      let novoStatusImovel;
      let contratoId = null;
      
      switch (this.status) {
        case 'Ativo':
          if (this.tipo === 'Locação') {
            novoStatusImovel = 'Locado Ativo';
            contratoId = this._id;
          } else if (this.tipo === 'Venda') {
            novoStatusImovel = 'Vendido';
            contratoId = this._id;
          }
          break;
        case 'Pendente':
          novoStatusImovel = 'Reservado';
          contratoId = this._id;
          break;
        case 'Rescindido':
        case 'Finalizado':
        case 'Vencido':
          // Verificar se há outros contratos ativos para este imóvel
          const outrosContratosAtivos = await mongoose.model('Contrato').findOne({
            imovelId: this.imovelId,
            _id: { $ne: this._id },
            status: 'Ativo'
          });
          
          if (!outrosContratosAtivos) {
            // Se não há outros contratos ativos, tornar disponível
            novoStatusImovel = this.tipo === 'Locação' ? 'Disponível para Locação' : 'Disponível para Venda';
            contratoId = null;
          }
          break;
      }
      
      if (novoStatusImovel) {
        await Imovel.findByIdAndUpdate(this.imovelId, {
          statusAnuncio: novoStatusImovel,
          contratoId: contratoId,
          dataStatusAtual: new Date()
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status do imóvel:', error);
      // Não bloquear a operação do contrato por erro na atualização do imóvel
    }
  }
  
  next();
});

// Middleware para atualizar status do imóvel quando contrato for removido
ContratoSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.imovelId) {
    try {
      const Imovel = mongoose.model('Imovel');
      
      // Verificar se há outros contratos ativos para este imóvel
      const outrosContratosAtivos = await mongoose.model('Contrato').findOne({
        imovelId: doc.imovelId,
        status: 'Ativo'
      });
      
      if (!outrosContratosAtivos) {
        // Se não há outros contratos ativos, tornar disponível
        const novoStatus = doc.tipo === 'Locação' ? 'Disponível para Locação' : 'Disponível para Venda';
        await Imovel.findByIdAndUpdate(doc.imovelId, {
          statusAnuncio: novoStatus,
          contratoId: null,
          dataStatusAtual: new Date(),
          observacoesStatus: 'Contrato removido - imóvel disponibilizado automaticamente'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status do imóvel após remoção do contrato:', error);
    }
  }
});

module.exports = mongoose.models?.Contrato || mongoose.model('Contrato', ContratoSchema);