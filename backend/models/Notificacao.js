// backend/models/Notificacao.js
const mongoose = require("mongoose");

const NotificacaoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, "O título é obrigatório."],
    trim: true
  },
  mensagem: {
    type: String,
    required: [true, "A mensagem é obrigatória."],
    trim: true
  },
  tipo: {
    type: String,
    enum: ["info", "warning", "success", "error"],
    default: "info"
  },
  destinatario: {
    type: String,
    required: [true, "O destinatário é obrigatório."]
  },
  remetente: {
    type: String,
    required: [true, "O remetente é obrigatório."]
  },
  lida: {
    type: Boolean,
    default: false
  },
  urgente: {
    type: Boolean,
    default: false
  },
  dataEnvio: {
    type: Date,
    default: Date.now
  },
  dataLeitura: {
    type: Date
  },
  link: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Notificacao || mongoose.model("Notificacao", NotificacaoSchema);

