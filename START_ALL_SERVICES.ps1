# RAGfolio - Start All Services
# Run this script to start Parser, Backend, and Frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RAGfolio Service Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Parser Service
Write-Host "[1/3] Starting Parser Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd C:\Users\Priyanshu\Desktop\RAGfolio\parser; .\venv\Scripts\Activate.ps1; Write-Host 'Parser Service Starting...' -ForegroundColor Green; python -m uvicorn app.main:app --reload --port 8001"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Backend Service
Write-Host "[2/3] Starting Backend Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd C:\Users\Priyanshu\Desktop\RAGfolio\backend; Write-Host 'Backend Service Starting...' -ForegroundColor Green; npm run dev"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend Service
Write-Host "[3/3] Starting Frontend Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd C:\Users\Priyanshu\Desktop\RAGfolio\frontend; Write-Host 'Frontend Service Starting...' -ForegroundColor Green; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services will open in separate windows:" -ForegroundColor White
Write-Host "  Parser:   http://localhost:8001" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: How to use:" -ForegroundColor Yellow
Write-Host "  1. Go to http://localhost:5173" -ForegroundColor Yellow
Write-Host "  2. Register/Login to your account" -ForegroundColor Yellow
Write-Host "  3. Upload a resume (PDF or DOCX)" -ForegroundColor Yellow
Write-Host "  4. Ask questions about the resume using AI Chat" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
