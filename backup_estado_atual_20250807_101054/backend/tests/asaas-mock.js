// backend/tests/asaas-mock.js
console.log('Iniciando simulação de integração com Asaas...');

// Simulação de criação de cliente
function simularCriacaoCliente() {
  console.log('Simulando criação de cliente no Asaas...');
  
  const clienteId = `cus_${Math.random().toString(36).substring(2, 15)}`;
  
  console.log('✅ Cliente criado com sucesso (simulação)!');
  console.log('ID do cliente:', clienteId);
  
  return clienteId;
}

// Simulação de criação de cobrança
function simularCriacaoCobranca(customerId) {
  console.log('Simulando criação de cobrança no Asaas...');
  
  const hoje = new Date();
  const vencimento = new Date();
  vencimento.setDate(hoje.getDate() + 7); // Vencimento em 7 dias
  
  const cobrancaId = `pay_${Math.random().toString(36).substring(2, 15)}`;
  
  console.log('✅ Cobrança criada com sucesso (simulação)!');
  console.log('ID da cobrança:', cobrancaId);
  console.log('URL do boleto:', `https://sandbox.asaas.com/boleto/${cobrancaId}`);
  
  return cobrancaId;
}

// Simulação de listagem de cobranças
function simularListagemCobrancas(customerId) {
  console.log('Simulando listagem de cobranças no Asaas...');
  
  const cobranças = [
    {
      id: `pay_${Math.random().toString(36).substring(2, 15)}`,
      customer: customerId,
      value: 100.00,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    }
  ];
  
  console.log('✅ Cobranças listadas com sucesso (simulação)!');
  console.log(`Total de cobranças: ${cobranças.length}`);
  
  return cobranças;
}

// Função principal para executar as simulações
function executarSimulacoes() {
  try {
    console.log('Iniciando simulações de integração com Asaas...');
    
    // Simular criação de cliente
    const customerId = simularCriacaoCliente();
    
    // Simular criação de cobrança
    const paymentId = simularCriacaoCobranca(customerId);
    
    // Simular listagem de cobranças
    const cobranças = simularListagemCobrancas(customerId);
    
    console.log('\n✅ Todas as simulações concluídas com sucesso!');
    console.log('\nObservação: Esta é uma simulação para fins de teste.');
    console.log('Para integração real, é necessário configurar uma chave de API válida do Asaas.');
  } catch (error) {
    console.error('\n❌ Falha nas simulações:', error.message);
  }
}

// Executar as simulações
executarSimulacoes();

