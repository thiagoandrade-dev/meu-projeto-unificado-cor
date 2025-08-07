# Script para fazer push sem ativar o Vim
# Configurações para evitar o pager/editor
$env:GIT_PAGER = ""
$env:GIT_EDITOR = "true"
$env:EDITOR = "true"

Write-Host "🚀 Iniciando push consolidado..." -ForegroundColor Green

# Verifica branch atual
$currentBranch = Get-Content ".git\HEAD" | ForEach-Object { $_.Split("/")[-1] }
Write-Host "📍 Branch atual: $currentBranch" -ForegroundColor Yellow

# Força o push da branch main
Write-Host "📤 Fazendo push da branch main..." -ForegroundColor Cyan
git push origin main --force-with-lease

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
    Write-Host "🎯 Consolidação completa no GitHub!" -ForegroundColor Magenta
} else {
    Write-Host "❌ Erro no push. Código: $LASTEXITCODE" -ForegroundColor Red
}

# Opcional: também fazer push da branch restore-backup-pre-pwa
Write-Host "📤 Fazendo push da branch restore-backup-pre-pwa..." -ForegroundColor Cyan
git push origin restore-backup-pre-pwa

Write-Host "🏁 Script finalizado!" -ForegroundColor Green