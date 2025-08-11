// Script para manter o backend do Render ativo
// Evita o "cold start" fazendo ping a cada 14 minutos

const https = require('https');

const BACKEND_URL = 'https://imobiliaria-firenze-backend.onrender.com/api/status';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutos em millisegundos

function pingBackend() {
    const now = new Date().toLocaleString('pt-BR');
    
    https.get(BACKEND_URL, (res) => {
        console.log(`✅ [${now}] Backend ativo - Status: ${res.statusCode}`);
    }).on('error', (err) => {
        console.log(`❌ [${now}] Erro no ping: ${err.message}`);
    });
}

// Ping inicial
console.log('🚀 Iniciando keep-alive do Render...');
pingBackend();

// Ping a cada 14 minutos
setInterval(pingBackend, PING_INTERVAL);

console.log(`⏰ Configurado para ping a cada ${PING_INTERVAL / 60000} minutos`);