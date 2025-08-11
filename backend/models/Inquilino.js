// backend/models/Inquilino.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const InquilinoSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, "O email é obrigatório."], 
    unique: true,
    trim: true,
    lowercase: true
  },
  senha: {
    type: String,
    required: [true, "A senha é obrigatória."],
    minlength: [6, "A senha deve ter pelo menos 6 caracteres."],
    select: false // Não retorna a senha por padrão nas consultas
  },
  nome: {
    type: String,
    required: [true, "O nome é obrigatório."],
    trim: true
  },
  perfil: {
    type: String,
    required: [true, "O perfil do usuário é obrigatório."],
    enum: ["admin", "inquilino", "proprietario", "corretor"],
    default: "inquilino"
  },
  status: {
    type: String,
    enum: ["ativo", "inativo", "pendente"],
    default: "ativo"
  },
  telefone: {
    type: String,
    trim: true
  },
  cpf: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Permite valores nulos únicos
  },
  rg: {
    type: String,
    trim: true
  },
  dataNascimento: {
    type: Date,
    required: false // Opcional para inquilinos existentes
  },
  endereco: {
    rua: { type: String, trim: true },
    numero: { type: String, trim: true },
    complemento: { type: String, trim: true },
    bairro: { type: String, trim: true },
    cidade: { type: String, trim: true },
    estado: { type: String, trim: true },
    cep: { type: String, trim: true }
  },
  dadosBancarios: {
    banco: { type: String, trim: true },
    agencia: { type: String, trim: true },
    conta: { type: String, trim: true },
    tipoConta: { 
      type: String, 
      enum: ['Corrente', 'Poupança'],
      default: 'Corrente'
    }
  },
  imovelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Imovel" 
  },
  asaasCustomerId: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  },
  ultimoAcesso: {
    type: Date
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// Método virtual para calcular idade
InquilinoSchema.virtual('idade').get(function() {
  if (!this.dataNascimento) return null;
  
  const hoje = new Date();
  const nascimento = new Date(this.dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  
  // Verifica se ainda não fez aniversário este ano
  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();
  const mesNascimento = nascimento.getMonth();
  const diaNascimento = nascimento.getDate();
  
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
    idade--;
  }
  
  return idade;
});

// Método para verificar se faz aniversário hoje
InquilinoSchema.methods.fazAniversarioHoje = function() {
  if (!this.dataNascimento) return false;
  
  const hoje = new Date();
  const nascimento = new Date(this.dataNascimento);
  
  return hoje.getDate() === nascimento.getDate() && 
         hoje.getMonth() === nascimento.getMonth();
};

// Criptografa a senha antes de salvar
InquilinoSchema.pre("save", async function(next) {
  // Só faz o hash da senha se ela foi modificada (ou é nova)
  if (!this.isModified("senha")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Garantir que campos virtuais sejam incluídos no JSON
InquilinoSchema.set('toJSON', { virtuals: true });
InquilinoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Inquilino || mongoose.model("Inquilino", InquilinoSchema);
