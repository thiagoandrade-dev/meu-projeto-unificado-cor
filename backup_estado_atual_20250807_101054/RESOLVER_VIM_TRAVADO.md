# 🚨 Guia para Resolver Vim Travado

## 🎯 Problema:
O Vim está travado e impedindo comandos Git de funcionar.

## 📋 Passos para Resolver:

### 1. **Primeiro, tente sair do Vim se estiver aberto:**
```
ESC ESC ESC ESC ESC
:qa!
ENTER
```

### 2. **Se não funcionar, tente forçar saída:**
```
ESC ESC ESC ESC ESC
:q!
ENTER
```

### 3. **Se ainda não funcionar, tente:**
```
ESC ESC ESC ESC ESC
:wq!
ENTER
```

### 4. **Última tentativa no Vim:**
```
ESC ESC ESC ESC ESC
ZZ
```

## 🔧 Se o Vim não responder, vamos matar o processo:

### 5. **Verificar processos do Vim:**
Execute no PowerShell:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*vim*"}
```

### 6. **Matar processos do Vim:**
```powershell
Stop-Process -Name "vim" -Force
Stop-Process -Name "gvim" -Force
```

### 7. **Verificar processos do Git:**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*git*"}
```

## 🧹 Limpeza de arquivos temporários:

### 8. **Remover arquivos swap do Vim:**
```powershell
Remove-Item ".\.git\*.swp" -Force -ErrorAction SilentlyContinue
Remove-Item ".\.git\*.swo" -Force -ErrorAction SilentlyContinue
Remove-Item ".\.git\*~" -Force -ErrorAction SilentlyContinue
```

## ✅ Teste final:
Depois de tudo, teste com:
```powershell
git status
```

---
**💡 Dica**: Se nada funcionar, podemos tentar reiniciar o terminal ou usar Git GUI!