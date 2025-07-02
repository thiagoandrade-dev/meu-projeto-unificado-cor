// backend/controllers/asaasController.js
const axios = require('axios');
const Inquilino = require('../models/Inquilino');

// URL e TOKEN da Asaas (deve vir do .env em produção)
const ASAAS_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://www.asaas.com/api/v3'
  : 'https://sandbox.asaas.com/api/v3';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY; // <<--- EDITAR NO .env

const config = {
  headers: {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
};

const criarCliente = async (req, res) => {
  try {
    const { nome, email, cpfCnpj, celular, inquilinoId } = req.body;

    const response = await axios.post(`${ASAAS_BASE_URL}/customers`, {
      name: nome,
      email,
      cpfCnpj,
      phone: celular
    }, config);

    const customer = response.data;

    // Vincula o ID do cliente Asaas ao Inquilino
    if (inquilinoId) {
      await Inquilino.findByIdAndUpdate(inquilinoId, {
        asaasCustomerId: customer._id
      });
    }

    res.status(201).json(customer);
  } catch (error) {
    const errorMessage = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : error.message;
    console.error("Erro ao criar cliente na Asaas:", errorMessage);
    res.status(500).json({ erro: `Erro ao criar cliente na Asaas: ${errorMessage}` });
  }
};

const criarCobranca = async (req, res) => {
  try {
    const { customerId, valor, vencimento, descricao } = req.body;

    const response = await axios.post(`${ASAAS_BASE_URL}/payments`, {
      customer: customerId,
      value: valor,
      dueDate: vencimento,
      description: descricao,
      billingType: 'BOLETO'
    }, config);

    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao criar cobrança:', error.response?.data || error.message);
    res.status(500).json({ erro: 'Erro ao criar cobrança' });
  }
};

const listarBoletos = async (req, res) => {
  try {
    const { customerId } = req.params;
    const response = await axios.get(`${ASAAS_BASE_URL}/payments?customer=${customerId}`, config);
    res.status(200).json(response.data.data);
  } catch (error) {
    console.error('Erro ao listar boletos:', error.response?.data || error.message);
    res.status(500).json({ erro: 'Erro ao buscar boletos' });
  }
};

const baixarBoletoPDF = async (req, res) => {
  try {
    const { boletoId } = req.params;
    const response = await axios.get(`${ASAAS_BASE_URL}/payments/${boletoId}/bankSlipPdf`, {
      ...config,
      responseType: 'arraybuffer'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.send(response.data);
  } catch (error) {
    console.error('Erro ao baixar PDF:', error.response?.data || error.message);
    res.status(500).json({ erro: 'Erro ao baixar o PDF do boleto' });
  }
};

module.exports = {
  criarCliente,
  criarCobranca,
  listarBoletos,
  baixarBoletoPDF
};
