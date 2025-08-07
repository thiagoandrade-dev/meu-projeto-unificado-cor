# Script Hacker: Atualizar GitHub via API REST
# Contorna completamente o Git local!

$repo = "thiagoandrade-dev/meu-projeto-unificado-cor"
$commitSha = "f73ba955b672cf9cdc4cffe85e6320d4ebf8e85f"

Write-Host "🕵️‍♂️ Modo Hacker Ativado!" -ForegroundColor Magenta
Write-Host "🎯 Alvo: $repo" -ForegroundColor Yellow
Write-Host "📍 Commit SHA: $commitSha" -ForegroundColor Cyan

# Primeiro, vamos verificar se conseguimos acessar o repo
$repoUrl = "https://api.github.com/repos/$repo"

try {
    Write-Host "🔍 Verificando repositório..." -ForegroundColor Green
    $repoInfo = Invoke-RestMethod -Uri $repoUrl -Method GET
    Write-Host "✅ Repositório encontrado: $($repoInfo.full_name)" -ForegroundColor Green
    Write-Host "📊 Stars: $($repoInfo.stargazers_count) | Forks: $($repoInfo.forks_count)" -ForegroundColor Blue
    
    # Verificar a branch main atual
    $mainBranchUrl = "https://api.github.com/repos/$repo/git/refs/heads/main"
    $mainBranch = Invoke-RestMethod -Uri $mainBranchUrl -Method GET
    Write-Host "🌿 Branch main atual SHA: $($mainBranch.object.sha)" -ForegroundColor Yellow
    
    if ($mainBranch.object.sha -eq $commitSha) {
        Write-Host "✅ GitHub já está atualizado com o commit consolidado!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ GitHub precisa ser atualizado" -ForegroundColor Red
        Write-Host "💡 Para atualizar via API, você precisaria de um token de acesso" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Erro ao acessar API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🏁 Análise completa!" -ForegroundColor Magenta