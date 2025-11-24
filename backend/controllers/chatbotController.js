const axios = require('axios');

const N8N_CHATBOT_URL = process.env.N8N_CHATBOT_URL; // e.g., https://n8n.example.com/webhook/chatbot
const N8N_API_KEY = process.env.N8N_API_KEY; // opcional

async function proxyMessage(req, res) {
  try {
    if (!N8N_CHATBOT_URL) {
      return res.status(503).json({
        erro: 'Chatbot não configurado',
        detalhes: 'Defina N8N_CHATBOT_URL (e N8N_API_KEY opcional) no .env'
      });
    }
    const { message, sessionId, metadata } = req.body || {};
    if (!message) return res.status(400).json({ erro: 'message é obrigatório' });
    const headers = { 'Content-Type': 'application/json' };
    if (N8N_API_KEY) headers['x-api-key'] = N8N_API_KEY;
    const response = await axios.post(N8N_CHATBOT_URL, { message, sessionId, metadata }, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    const msg = error.response?.data || error.message;
    res.status(500).json({ erro: 'Falha ao encaminhar mensagem para N8N', detalhes: msg });
  }
}

module.exports = { proxyMessage };