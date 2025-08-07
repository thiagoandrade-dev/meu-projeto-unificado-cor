# Script para configurar Git sem Vim
Write-Host "🔧 Configurando Git para não usar Vim..." -ForegroundColor Yellow

# Configurar Git para usar notepad como editor (mais simples)
Write-Host "📝 Configurando editor do Git..." -ForegroundColor Cyan
git config --global core.editor "notepad.exe"

# Configurar pager para não usar less/more
Write-Host "📄 Configurando pager do Git..." -ForegroundColor Cyan
git config --global core.pager "cat"

# Desabilitar auto-launch do editor em merges
Write-Host "🔀 Configurando merge..." -ForegroundColor Cyan
git config --global merge.tool "vimdiff"
git config --global merge.tool ""
git config --global core.autocrlf true

# Verificar configurações
Write-Host "✅ Configurações atuais:" -ForegroundColor Green
Write-Host "Editor: " -NoNewline -ForegroundColor Yellow
git config --global core.editor
Write-Host "Pager: " -NoNewline -ForegroundColor Yellow
git config --global core.pager

Write-Host "🎯 Testando Git status..." -ForegroundColor Magenta
git status --porcelain

Write-Host "✨ Git configurado com sucesso! Agora vamos tentar o push!" -ForegroundColor Green