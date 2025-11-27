#!/bin/bash
# Use PORT from Render environment or default to 8001
PORT=${PORT:-8001}
echo "Starting parser service on port $PORT"
uvicorn app.main:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 75
