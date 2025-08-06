// =============================================
// 1. IMPORTAÇÕES E CONFIGURAÇÕES INICIAIS
// =============================================
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const verificarToken = require("./middlewares/verificarToken"); // Adicionado

// Rotas
const authRoutes = require("./routes/auth");
const imovelRoutes = require("./routes/imovel");
const juridicoRoutes = require("./routes/juridico");
const dashboardRoutes = require("./routes/dashboard");
const contratoRoutes = require("./routes/contrato");
const contatoRoutes = require("./routes/contato");
const notificacaoRoutes = require("./routes/notificacao");
const asaasRoutes = require('./routes/asaasRoutes');
const usuarioRoutes = require('./routes/usuario');
const esqueceuSenhaRoutes = require('./routes/esqueceuSenha');
const relatorioRoutes = require('./routes/relatorio');
const configRoutes = require('./routes/configRoutes');
const app = express();

// =============================================
// 2. MIDDLEWARES (ORDEM IMPORTA!)
// =============================================
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        "img-src": ["'self'", "data:", "http://localhost:5000"],
      },
    },
  })
);

const whitelist = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5000",
  "http://localhost:8080",
  "http://localhost:8081",
  "https://www.imobiliariafirenze.com.br",
  "https://imobiliariafirenze.com.br",
  "https://imobiliaria-firenze-backend.onrender.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (arquivos locais, Postman, etc.)
    if (!origin) {
      console.log("🌐 CORS permitido para requisição sem origin (arquivo local)");
      callback(null, true);
      return;
    }
    
    // Permitir origins da whitelist
    if (whitelist.includes(origin)) {
      console.log("🌐 CORS permitido para origem:", origin);
      callback(null, true);
      return;
    }
    
    // Permitir file:// para desenvolvimento
    if (origin.startsWith('file://')) {
      console.log("🌐 CORS permitido para arquivo local:", origin);
      callback(null, true);
      return;
    }
    
    console.warn("🌐 CORS bloqueado para origem:", origin);
    callback(new Error("Não permitido por CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200 // Para suportar navegadores legados
};

app.use(cors(corsOptions));


app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// =============================================
// 3. CONEXÃO COM O BANCO DE DADOS
// =============================================
const DB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/firenzeImobiliaria";

mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado ao MongoDB!"))
.catch(err => {
  console.error("❌ Falha na conexão com MongoDB:", err);
  process.exit(1);
});

// =============================================
// 4. ROTAS PRINCIPAIS (API)
// =============================================
app.use("/api/auth", authRoutes);
app.use("/api/imoveis", imovelRoutes);
app.use("/api/juridico", juridicoRoutes);
app.use("/api/contratos", contratoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contato", contatoRoutes);
app.use("/api/notifications", notificacaoRoutes);
app.use('/api', asaasRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/senha', esqueceuSenhaRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/config', configRoutes);
// Verificação de saúde do servidor
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    database: mongoose.connection.readyState === 1 ? "conectado" : "offline",
    timestamp: new Date().toISOString()
  });
});

// =============================================
// 5. SWAGGER 
// =============================================

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Firenze Imobiliária",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./routes/*.js"],
};

app.use("/api-docs", 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerJsdoc(swaggerOptions))
);


// =============================================
// 6. ARQUIVOS ESTÁTICOS (FRONTEND)
// =============================================
//app.use("/uploads", verificarToken, express.static(path.join(__dirname, "uploads"))); // Protegido
//app.use(express.static(path.join(__dirname, "../frontend/public")));
//app.use("/admin", express.static(path.join(__dirname, "../frontend/admin")));

// Redirecionamentos
app.get("/login.html", (req, res) => {
  res.redirect("/index.html?openLogin=true");
});

// =============================================
// 7. TRATAMENTO DE ERROS
// =============================================
app.use((req, res) => {
  res.status(404).json({ 
    erro: "Rota não encontrada",
    //sugestao: "Verifique a documentação em /api-docs" // Ativar se usar Swagger
  });
});

app.use((err, req, res, next) => {
  console.error("🔥 Erro:", err.stack);
  
  // Erros de upload
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ erro: "Arquivo muito grande (máx. 50MB)" });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ erro: "Tipo de arquivo não permitido" });
  }

  // Erros de autenticação
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ erro: "Token JWT inválido" });
  }
  // Erros de validação do express-validator (para melhor feedback no frontend)
  if (err.errors && Array.isArray(err.errors)) {
      return res.status(400).json({ erros: err.errors.map(e => ({ [e.path]: e.msg })) });
  }

  res.status(500).json({ 
    erro: "Erro interno no servidor",
    detalhes: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// =============================================
// 8. INICIALIZAÇÃO DO SERVIDOR
// =============================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
🚀 Servidor rodando na porta ${PORT}
`);
});