const mongoose = require('mongoose');
require('dotenv').config();

console.log('Tentando conectar ao MongoDB...');
console.log('String de conexão:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/firenze')
  .then(() => {
    console.log('✅ Conexão bem-sucedida!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ ERRO na conexão:', err.message);
    process.exit(1);
  });