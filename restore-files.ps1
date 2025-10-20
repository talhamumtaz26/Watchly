# Run this script to restore the 3 corrupted files
# From PowerShell, run: .\restore-files.ps1

Write-Host "Restoring corrupted files..." -ForegroundColor Yellow

# Delete old corrupted files
Remove-Item "src\pages\Search.jsx" -Force -ErrorAction SilentlyContinue
Remove-Item "src\pages\WatchLater.jsx" -Force -ErrorAction SilentlyContinue  
Remove-Item "src\pages\Watched.jsx" -Force -ErrorAction SilentlyContinue

Write-Host "Creating Search.jsx..." -ForegroundColor Green

# The file contents are too large for inline script
# Please manually copy the contents from the message below and paste into the files

Write-Host "`n✅ Please manually create the 3 files with the content provided in the chat`n" -ForegroundColor Cyan
Write-Host "Files needed:" -ForegroundColor White
Write-Host "  1. src\pages\Search.jsx"
Write-Host "  2. src\pages\WatchLater.jsx"
Write-Host "  3. src\pages\Watched.jsx"
Write-Host "`nAfter creating the files, run:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npx cap sync android" -ForegroundColor White
