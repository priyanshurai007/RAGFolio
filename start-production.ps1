# RAGfolio Production Start Script

Write-Host "Starting RAGfolio Services..." -ForegroundColor Green

# Start Parser
Write-Host "
[1/3] Starting Parser Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd parser; python -m uvicorn app.main:app --host 0.0.0.0 --port 8001" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Backend  
Write-Host "[2/3] Starting Backend Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[3/3] Starting Frontend Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "
 All services started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "Parser:   http://localhost:8001" -ForegroundColor Cyan
