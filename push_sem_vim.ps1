# Script Ultra-Hacker: Push sem Vim usando comandos de baixo nível
# Configurações anti-Vim
$env:GIT_PAGER = "cat"
$env:GIT_EDITOR = "echo"
$env:EDITOR = "echo"
$env:VISUAL = "echo"

Write-Host "🔥 MODO ULTRA-HACKER ATIVADO!" -ForegroundColor Red
Write-Host "🎯 Fazendo push direto sem Vim..." -ForegroundColor Yellow

# Verifica se estamos na branch main
$currentBranch = (Get-Content ".git\HEAD").Split("/")[-1]
Write-Host "📍 Branch atual: $currentBranch" -ForegroundColor Cyan

if ($currentBranch -eq "main") {
    Write-Host "✅ Estamos na branch main" -ForegroundColor Green
    
    # Comando Git direto com todas as proteções anti-Vim
    Write-Host "🚀 Executando push..." -ForegroundColor Magenta
    
    # Usando git push com configurações específicas
    $pushResult = & git -c core.editor=true -c core.pager=cat push origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 SUCESSO! Push realizado!" -ForegroundColor Green
        Write-Host "✨ Consolidação enviada para o GitHub!" -ForegroundColor Magenta
    } else {
        Write-Host "❌ Erro no push:" -ForegroundColor Red
        Write-Host $pushResult -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Não estamos na branch main!" -ForegroundColor Red
}

Write-Host "🏁 Script finalizado!" -ForegroundColor Blue