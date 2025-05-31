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
    minlength: [6, "A senha deve ter pelo menos 6 caracteres."]
  },
  nome: {
    type: String,
    required: [true, "O nome é obrigatório."],
    trim: true
  },
  perfil: {
    type: String,
    required: [true, "O perfil do usuário é obrigatório."],
    enum: ["admin", "inquilino"],
    default: "inquilino"
  },
  imovelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Imovel" 
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

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

module.exports = mongoose.models.Inquilino || mongoose.model("Inquilino", InquilinoSchema);
