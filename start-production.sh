#!/bin/bash

# RAGfolio Production Start Script for Linux/Mac

echo "🚀 Starting RAGfolio Services..."

# Start Parser
echo ""
echo "[1/3] Starting Parser Service..."
cd parser
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 &
PARSER_PID=$!
cd ..

sleep 3

# Start Backend
echo "[2/3] Starting Backend Service..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 3

# Start Frontend
echo "[3/3] Starting Frontend Service..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 2

echo ""
echo "✅ All services started!"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3000"
echo "Parser:   http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C and kill all processes
trap "kill $PARSER_PID $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for all processes
wait
