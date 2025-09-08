Get-ChildItem -Path "data" -Filter "*.json" | Remove-Item -Force
Write-Host "Arquivos .json antigos removidos da pasta 'data'."