# Script para resetar completamente o repositório GitHub
# Mantém apenas o estado atual do projeto, eliminando todo histórico

Write-Host "=== RESET COMPLETO DO REPOSITÓRIO ===" -ForegroundColor Yellow
Write-Host "Este script vai:" -ForegroundColor Cyan
Write-Host "1. Remover todo histórico Git local" -ForegroundColor White
Write-Host "2. Criar um novo repositório Git" -ForegroundColor White
Write-Host "3. Fazer commit de todo o estado atual" -ForegroundColor White
Write-Host "4. Forçar push para GitHub (sobrescrever tudo)" -ForegroundColor White
Write-Host ""

# Confirmar ação
$confirmacao = Read-Host "Tem certeza? Digite 'SIM' para continuar"
if ($confirmacao -ne "SIM") {
    Write-Host "Operação cancelada." -ForegroundColor Red
    exit
}

Write-Host "Iniciando reset completo..." -ForegroundColor Green

# 1. Remover pasta .git (todo histórico)
Write-Host "1. Removendo histórico Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
    Write-Host "   ✓ Histórico removido" -ForegroundColor Green
}

# 2. Inicializar novo repositório
Write-Host "2. Criando novo repositório..." -ForegroundColor Yellow
git init
git branch -M main
Write-Host "   ✓ Novo repositório criado" -ForegroundColor Green

# 3. Configurar Git para não usar vim
Write-Host "3. Configurando Git..." -ForegroundColor Yellow
git config core.editor "notepad.exe"
Write-Host "   ✓ Editor configurado" -ForegroundColor Green

# 4. Adicionar remote do GitHub
Write-Host "4. Conectando ao GitHub..." -ForegroundColor Yellow
git remote add origin https://github.com/thiagosullivan/meu-projeto-unificado-cor.git
Write-Host "   ✓ Remote configurado" -ForegroundColor Green

# 5. Adicionar todos os arquivos
Write-Host "5. Adicionando todos os arquivos..." -ForegroundColor Yellow
git add .
Write-Host "   ✓ Arquivos adicionados" -ForegroundColor Green

# 6. Fazer commit inicial
Write-Host "6. Fazendo commit inicial..." -ForegroundColor Yellow
git commit -m "Reset completo: Estado atual do projeto unificado"
Write-Host "   ✓ Commit realizado" -ForegroundColor Green

# 7. Push forçado (sobrescreve tudo no GitHub)
Write-Host "7. Enviando para GitHub (força)..." -ForegroundColor Yellow
git push -f origin main
Write-Host "   ✓ Push realizado com sucesso!" -ForegroundColor Green

Write-Host ""
Write-Host "=== RESET COMPLETO FINALIZADO ===" -ForegroundColor Green
Write-Host "Seu repositório GitHub agora contém apenas:" -ForegroundColor Cyan
Write-Host "- Branch main (único)" -ForegroundColor White
Write-Host "- Estado atual do seu projeto" -ForegroundColor White
Write-Host "- Sem histórico anterior" -ForegroundColor White
Write-Host ""
Write-Host "Repositório: https://github.com/thiagosullivan/meu-projeto-unificado-cor" -ForegroundColor Blue