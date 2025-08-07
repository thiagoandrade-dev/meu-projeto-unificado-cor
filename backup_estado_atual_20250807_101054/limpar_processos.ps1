# Script simples para limpar processos travados
Write-Host "🔍 Verificando processos..." -ForegroundColor Yellow

# Verificar processos do Vim
$vimProcesses = Get-Process | Where-Object {$_.ProcessName -like "*vim*"}
if ($vimProcesses) {
    Write-Host "❌ Encontrados processos do Vim:" -ForegroundColor Red
    $vimProcesses | Format-Table ProcessName, Id
    
    Write-Host "🔨 Matando processos do Vim..." -ForegroundColor Yellow
    Stop-Process -Name "vim" -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "gvim" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Processos do Vim finalizados!" -ForegroundColor Green
} else {
    Write-Host "✅ Nenhum processo do Vim encontrado" -ForegroundColor Green
}

# Limpar arquivos temporários
Write-Host "🧹 Limpando arquivos temporários..." -ForegroundColor Yellow
Remove-Item ".\.git\*.swp" -Force -ErrorAction SilentlyContinue
Remove-Item ".\.git\*.swo" -Force -ErrorAction SilentlyContinue
Remove-Item ".\.git\*~" -Force -ErrorAction SilentlyContinue

Write-Host "🎯 Testando Git..." -ForegroundColor Cyan
git --version

Write-Host "✨ Limpeza concluída! Tente o git status agora." -ForegroundColor Green