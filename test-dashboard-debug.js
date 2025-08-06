// Script para testar o dashboard e identificar problemas
const axios = require('axios');

async function testDashboard() {
  try {
    console.log('🔍 Testando funcionalidade do dashboard...\n');
    
    // 1. Fazer login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'thiago@email.com',
      senha: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('Token:', token.substring(0, 20) + '...\n');
    
    // 2. Testar endpoint do dashboard completo
    console.log('2. Testando endpoint do dashboard completo...');
    const dashboardResponse = await axios.get('http://localhost:5000/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dashboard completo funcionando');
    console.log('Dados recebidos:', Object.keys(dashboardResponse.data));
    console.log('Estatísticas:', dashboardResponse.data.estatisticas);
    console.log('');
    
    // 3. Testar endpoint de estatísticas
    console.log('3. Testando endpoint de estatísticas...');
    const estatisticasResponse = await axios.get('http://localhost:5000/api/dashboard/estatisticas', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Estatísticas funcionando');
    console.log('Estatísticas:', estatisticasResponse.data);
    console.log('');
    
    // 4. Testar endpoint de receita mensal
    console.log('4. Testando endpoint de receita mensal...');
    const receitaResponse = await axios.get('http://localhost:5000/api/dashboard/receita-mensal', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Receita mensal funcionando');
    console.log('Dados de receita:', receitaResponse.data.length, 'meses');
    console.log('');
    
    // 5. Testar endpoint de ocupação
    console.log('5. Testando endpoint de ocupação...');
    const ocupacaoResponse = await axios.get('http://localhost:5000/api/dashboard/ocupacao', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ocupação funcionando');
    console.log('Dados de ocupação:', ocupacaoResponse.data);
    console.log('');
    
    console.log('🎉 Todos os testes do dashboard passaram com sucesso!');
    console.log('O problema pode estar no frontend ou na comunicação entre frontend e backend.');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

testDashboard();