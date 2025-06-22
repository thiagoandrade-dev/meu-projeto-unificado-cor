// backend/tests/asaas-test.js
require('dotenv').config();
const axios = require('axios');

// URL e TOKEN da Asaas (deve vir do .env em produção)
const ASAAS_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://www.asaas.com/api/v3'
  : 'https://sandbox.asaas.com/api/v3';

// Substitua por sua chave de API do sandbox Asaas para testes
const ASAAS_API_KEY = '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNDMxMDg6OiRhYWNoXzJmNjQ1ZGNjLTRhZjQtNDJkYi05YzBhLTVlYTUwMTY0ZmE3Mg==';

const config = {
  headers: {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
};

// Função para testar a criação de cliente
async function testarCriacaoCliente() {
  try {
    console.log('Testando criação de cliente no Asaas...');
    
    const clienteData = {
      name: 'Cliente Teste',
      email: `teste${Date.now()}@example.com`,
      cpfCnpj: '12345678909', // CPF fictício para teste
      phone: '11999999999'
    };
    
    const response = await axios.post(`${ASAAS_BASE_URL}/customers`, clienteData, config);
    
    console.log('✅ Cliente criado com sucesso!');
    console.log('ID do cliente:', response.data.id);
    
    return response.data.id;
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar a criação de cobrança
async function testarCriacaoCobranca(customerId) {
  try {
    console.log('Testando criação de cobrança no Asaas...');
    
    const hoje = new Date();
    const vencimento = new Date();
    vencimento.setDate(hoje.getDate() + 7); // Vencimento em 7 dias
    
    const cobrancaData = {
      customer: customerId,
      billingType: 'BOLETO',
      value: 100.00,
      dueDate: vencimento.toISOString().split('T')[0],
      description: 'Teste de cobrança via API'
    };
    
    const response = await axios.post(`${ASAAS_BASE_URL}/payments`, cobrancaData, config);
    
    console.log('✅ Cobrança criada com sucesso!');
    console.log('ID da cobrança:', response.data.id);
    console.log('URL do boleto:', response.data.bankSlipUrl);
    
    return response.data.id;
  } catch (error) {
    console.error('❌ Erro ao criar cobrança:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar a listagem de cobranças
async function testarListagemCobrancas(customerId) {
  try {
    console.log('Testando listagem de cobranças no Asaas...');
    
    const response = await axios.get(`${ASAAS_BASE_URL}/payments?customer=${customerId}`, config);
    
    console.log('✅ Cobranças listadas com sucesso!');
    console.log(`Total de cobranças: ${response.data.data.length}`);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Erro ao listar cobranças:', error.response?.data || error.message);
    throw error;
  }
}

// Função principal para executar os testes
async function executarTestes() {
  try {
    console.log('Iniciando testes de integração com Asaas...');
    console.log('URL da API:', ASAAS_BASE_URL);
    
    // Testar criação de cliente
    const customerId = await testarCriacaoCliente();
    
    // Testar criação de cobrança
    const paymentId = await testarCriacaoCobranca(customerId);
    
    // Testar listagem de cobranças
    await testarListagemCobrancas(customerId);
    
    console.log('\n✅ Todos os testes concluídos com sucesso!');
  } catch (error) {
    console.error('\n❌ Falha nos testes:', error.message);
  }
}

// Executar os testes
executarTestes();

