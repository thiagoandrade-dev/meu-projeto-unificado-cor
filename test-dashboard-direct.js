const axios = require('axios');

// Configuração base igual ao frontend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testDashboard() {
  try {
    console.log('🔍 Testando Dashboard - Simulação Frontend');
    console.log('==========================================');

    // 1. Login
    console.log('\n1. Fazendo login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@firenze.com',
      senha: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('Token:', token.substring(0, 20) + '...');

    // 2. Configurar token para próximas requisições
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 3. Testar endpoint dashboard completo
    console.log('\n2. Testando /api/dashboard...');
    const dashboardResponse = await api.get('/dashboard');
    console.log('✅ Dashboard Response:', JSON.stringify(dashboardResponse.data, null, 2));

    // 4. Testar estatísticas
    console.log('\n3. Testando /api/dashboard/estatisticas...');
    const estatisticasResponse = await api.get('/dashboard/estatisticas');
    console.log('✅ Estatísticas Response:', JSON.stringify(estatisticasResponse.data, null, 2));

    // 5. Testar receita mensal
    console.log('\n4. Testando /api/dashboard/receita-mensal...');
    const receitaResponse = await api.get('/dashboard/receita-mensal');
    console.log('✅ Receita Mensal Response:', JSON.stringify(receitaResponse.data, null, 2));

    // 6. Testar ocupação
    console.log('\n5. Testando /api/dashboard/ocupacao...');
    const ocupacaoResponse = await api.get('/dashboard/ocupacao');
    console.log('✅ Ocupação Response:', JSON.stringify(ocupacaoResponse.data, null, 2));

    console.log('\n🎉 Todos os testes passaram! Backend está funcionando corretamente.');

  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    if (error.config) {
      console.error('URL:', error.config.url);
      console.error('Method:', error.config.method);
    }
  }
}

testDashboard();