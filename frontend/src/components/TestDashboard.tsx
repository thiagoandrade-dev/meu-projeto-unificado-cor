import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TestDashboard = () => {
  const [logs, setLogs] = useState<Array<{message: string, type: string, time: string}>>([]);

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

  const testDashboard = async () => {
    addLog('🔄 Iniciando teste do dashboard...', 'info');
    
    try {
      // Teste básico de conectividade
      addLog('1️⃣ Testando conectividade com backend...', 'info');
      
      const response = await fetch(`${API_URL}/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        addLog('✅ Dashboard acessível!', 'success');
        addLog(`Dados recebidos: ${JSON.stringify(data)}`, 'info');
      } else {
        addLog(`❌ Erro ao acessar dashboard - Status: ${response.status}`, 'error');
      }
      
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Erro: ${err.message}`, 'error');
    }
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
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Teste do Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testDashboard}>
                Testar Dashboard
              </Button>
              <Button variant="outline" onClick={clearLogs}>
                Limpar Logs
              </Button>
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
                    Nenhum log ainda. Clique em "Testar Dashboard" para começar.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDashboard;