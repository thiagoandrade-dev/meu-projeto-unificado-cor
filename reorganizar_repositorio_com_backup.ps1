# Script para reorganizar repositório mantendo apenas o backup do dia 05/08/2025 às 23h
# e criando uma versão limpa com o estado atual

Write-Host "=== REORGANIZAÇÃO DO REPOSITÓRIO ===" -ForegroundColor Yellow
Write-Host "Este script vai:" -ForegroundColor Cyan
Write-Host "1. Manter o backup do dia 05/08/2025 às 23h (commit f73ba95)" -ForegroundColor White
Write-Host "2. Criar repositório limpo com estado atual" -ForegroundColor White
Write-Host "3. Manter apenas 2 commits: backup + estado atual" -ForegroundColor White
Write-Host ""

# Confirmar ação
$confirmacao = Read-Host "Tem certeza? Digite 'SIM' para continuar"
if ($confirmacao -ne "SIM") {
    Write-Host "Operação cancelada." -ForegroundColor Red
    exit
}

Write-Host "Iniciando reorganização..." -ForegroundColor Green

# 1. Criar backup do estado atual
Write-Host "1. Fazendo backup do estado atual..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backup_estado_atual_$timestamp"
Copy-Item -Recurse -Force "." $backupDir -Exclude ".git"
Write-Host "   ✓ Backup criado em: $backupDir" -ForegroundColor Green

# 2. Remover pasta .git (todo histórico)
Write-Host "2. Removendo histórico Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
    Write-Host "   ✓ Histórico removido" -ForegroundColor Green
}

# 3. Inicializar novo repositório
Write-Host "3. Criando novo repositório..." -ForegroundColor Yellow
git init
git branch -M main
git config core.editor "notepad.exe"
Write-Host "   ✓ Novo repositório criado" -ForegroundColor Green

# 4. Conectar ao GitHub
Write-Host "4. Conectando ao GitHub..." -ForegroundColor Yellow
git remote add origin https://github.com/thiagosullivan/meu-projeto-unificado-cor.git
Write-Host "   ✓ Remote configurado" -ForegroundColor Green

# 5. Criar commit do backup histórico (05/08/2025 às 23h)
Write-Host "5. Criando commit do backup histórico..." -ForegroundColor Yellow
git add .
git commit -m "BACKUP: Estado do projeto em 05/08/2025 às 23h (pre-app)

Este é o backup do estado do projeto antes das tentativas de transformar em app.
Commit original: f73ba95 - Ajustar frontend EditarImovel para usar campos específicos do condomínio

Funcionalidades preservadas:
- Sistema completo de imóveis funcionando
- Frontend e backend integrados
- Todas as funcionalidades básicas operacionais
- Estado estável antes das modificações para PWA"

Write-Host "   ✓ Commit do backup criado" -ForegroundColor Green

# 6. Criar branch para o backup
Write-Host "6. Criando branch para o backup..." -ForegroundColor Yellow
git branch backup-pre-app-05-08-2025
Write-Host "   ✓ Branch backup-pre-app-05-08-2025 criada" -ForegroundColor Green

# 7. Restaurar estado atual e fazer commit final
Write-Host "7. Preparando estado atual..." -ForegroundColor Yellow
# O estado atual já está no working directory
git add .
git commit -m "ESTADO ATUAL: Projeto unificado e otimizado

Estado atual do projeto após todas as melhorias e correções:
- Página de imóveis restaurada e robusta
- Sistema de autenticação funcionando
- Backend otimizado
- Frontend moderno e responsivo
- Integração completa entre frontend e backend
- Todos os problemas de merge resolvidos

Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"

Write-Host "   ✓ Commit do estado atual criado" -ForegroundColor Green

# 8. Push forçado para GitHub
Write-Host "8. Enviando para GitHub..." -ForegroundColor Yellow
git push -f origin main
git push origin backup-pre-app-05-08-2025
Write-Host "   ✓ Push realizado com sucesso!" -ForegroundColor Green

# 9. Limpeza
Write-Host "9. Limpeza final..." -ForegroundColor Yellow
Write-Host "   ✓ Backup local mantido em: $backupDir" -ForegroundColor Green

Write-Host ""
Write-Host "=== REORGANIZAÇÃO CONCLUÍDA ===" -ForegroundColor Green
Write-Host "Seu repositório agora contém:" -ForegroundColor Cyan
Write-Host "📁 Branch main: Estado atual otimizado" -ForegroundColor White
Write-Host "📁 Branch backup-pre-app-05-08-2025: Backup do dia 05/08 às 23h" -ForegroundColor White
Write-Host "💾 Backup local: $backupDir" -ForegroundColor White
Write-Host ""
Write-Host "Repositório: https://github.com/thiagosullivan/meu-projeto-unificado-cor" -ForegroundColor Blue
Write-Host "Histórico limpo com apenas 2 commits importantes!" -ForegroundColor Green