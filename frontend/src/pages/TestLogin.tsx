import React, { useState } from 'react';

// interface LogEntry {
//   message: string;
//   type: 'info' | 'success' | 'error';
//   timestamp: string;
// } // Interface não utilizada

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TestLogin: React.FC = () => {
  const [logs, setLogs] = useState<Array<{message: string, type: string, time: string}>>([]);
  const [email, setEmail] = useState('admin@imobiliariafirenze.com.br');
  const [senha, setSenha] = useState('admin123');

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const newLog = {
      message,
      type,
      time: new Date().toLocaleTimeString()
    };
    setLogs(prev => [...prev, newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testLogin = async () => {
    addLog('🔄 Iniciando teste de login...', 'info');
    addLog(`Email: ${email}`, 'info');
    addLog(`Senha: ${senha}`, 'info');
    addLog(`User Agent: ${navigator.userAgent}`, 'info');
    addLog(`URL atual: ${window.location.href}`, 'info');
    
    // Teste 1: Verificar se o backend está respondendo
    addLog('1️⃣ Testando conectividade com o backend...', 'info');
    try {
      const healthCheck = await fetch(`${API_URL}/status`, {
        method: 'GET',
        mode: 'cors'
      });
      addLog(`✅ Backend Status: ${healthCheck.status}`, 'success');
      const healthData = await healthCheck.text();
      addLog(`Backend Response: ${healthData}`, 'info');
    } catch (healthError) {
      addLog(`❌ Backend não está respondendo: ${(healthError as Error).message}`, 'error');
      return;
    }

    // Teste 2: Verificar OPTIONS (preflight)
    addLog('2️⃣ Testando preflight OPTIONS...', 'info');
    try {
      const optionsResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      addLog(`✅ OPTIONS Status: ${optionsResponse.status}`, 'success');
      addLog(`CORS Headers: ${JSON.stringify([...optionsResponse.headers.entries()])}`, 'info');
    } catch (optionsError) {
      addLog(`❌ Erro no OPTIONS: ${(optionsError as Error).message}`, 'error');
    }

    // Teste 3: XMLHttpRequest (alternativa ao fetch)
    addLog('3️⃣ Testando com XMLHttpRequest...', 'info');
    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/auth/login`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onreadystatechange = function() {
          addLog(`XHR ReadyState: ${xhr.readyState}, Status: ${xhr.status}`, 'info');
          
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              addLog(`✅ XHR Success: ${xhr.responseText}`, 'success');
              resolve(xhr.responseText);
            } else {
              addLog(`❌ XHR Error: Status ${xhr.status}`, 'error');
              reject(new Error(`XHR failed with status ${xhr.status}`));
            }
          }
        };
        
        xhr.onerror = function() {
          addLog(`❌ XHR Network Error`, 'error');
          reject(new Error('XHR Network Error'));
        };
        
        xhr.onabort = function() {
          addLog(`❌ XHR Request Aborted`, 'error');
          reject(new Error('XHR Request Aborted'));
        };
        
        xhr.ontimeout = function() {
          addLog(`❌ XHR Timeout`, 'error');
          reject(new Error('XHR Timeout'));
        };
        
        xhr.send(JSON.stringify({
          email: email,
          senha: senha
        }));
      });
    } catch (xhrError) {
      addLog(`❌ XMLHttpRequest falhou: ${(xhrError as Error).message}`, 'error');
    }

    // Teste 4: Fetch com AbortController
    addLog('4️⃣ Testando fetch com AbortController...', 'info');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        addLog('⏰ Fetch abortado por timeout (10s)', 'error');
      }, 10000);

      const fetchResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        mode: 'cors',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          senha: senha
        })
      });

      clearTimeout(timeoutId);
      addLog(`✅ Fetch Status: ${fetchResponse.status}`, 'success');
      
      const responseText = await fetchResponse.text();
      addLog(`Fetch Response: ${responseText}`, 'info');
      
      if (fetchResponse.ok) {
        try {
          const responseData = JSON.parse(responseText);
          addLog('✅ Login realizado com sucesso!', 'success');
          addLog(`Token recebido: ${responseData.token ? 'SIM' : 'NÃO'}`, 'success');
        } catch (parseError) {
          addLog(`❌ Erro ao parsear resposta: ${(parseError as Error).message}`, 'error');
        }
      }
      
    } catch (fetchError) {
      const err = fetchError as Error;
      addLog(`❌ Fetch Error: ${err.message}`, 'error');
      
      if (err.name === 'AbortError') {
        addLog('🚨 Requisição foi abortada!', 'error');
      } else if (err.message.includes('CORS')) {
        addLog('🚨 Problema de CORS detectado!', 'error');
      } else if (err.message.includes('Failed to fetch')) {
        addLog('🚨 Falha na conexão de rede!', 'error');
      }
    }

    // Teste 5: Verificar se há bloqueios de segurança
    addLog('5️⃣ Verificando configurações de segurança...', 'info');
    addLog(`Protocol: ${window.location.protocol}`, 'info');
    addLog(`Host: ${window.location.host}`, 'info');
    addLog(`Mixed Content: ${window.location.protocol === 'https:' ? 'Possível problema com HTTP' : 'OK'}`, 'info');
  };

  const getLogStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug Login Error</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Configuração Atual:</h3>
        <p>Backend: {API_URL.replace('/api', '')}</p>
        <p>Frontend: http://localhost:8081</p>
        <p>API Base: {API_URL}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Teste de Login</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={testLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Fazer Login
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Limpar Logs
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Logs:</h3>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-3 rounded-md border ${getLogStyle(log.type)}`}
            >
              <strong>{log.time}:</strong> {log.message}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-3 bg-gray-50 rounded-md text-gray-500">
              Nenhum log ainda. Clique em "Fazer Login" para começar o teste.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestLogin;