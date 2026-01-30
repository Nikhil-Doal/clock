# Ambient Clock - Start Script
# Run this script to start both backend and frontend

Write-Host "Starting Ambient Clock..." -ForegroundColor Cyan

# Start backend in new window
Write-Host "Starting Flask backend on http://localhost:5000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; .\.venv\Scripts\Activate.ps1; python backend/app.py"

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start frontend in new window
Write-Host "Starting Next.js frontend on http://localhost:3000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "Both servers starting..." -ForegroundColor Yellow
Write-Host "- Backend: http://localhost:5000" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Open http://localhost:3000 in your browser" -ForegroundColor Cyan
