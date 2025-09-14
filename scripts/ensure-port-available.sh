#!/bin/bash

# Script to find and kill process using port 3000

PORT=3000
PID=$(lsof -t -i:$PORT)

if [ -n "$PID" ]; then
  echo "Found process $PID using port $PORT. Attempting to kill it..."
  kill -15 $PID
  
  # Wait a moment and check if it's still running
  sleep 2
  if lsof -t -i:$PORT >/dev/null; then
    echo "Process still running. Attempting force kill..."
    kill -9 $PID
    sleep 1
  fi
  
  if lsof -t -i:$PORT >/dev/null; then
    echo "Failed to free port $PORT. Please stop the process manually."
    exit 1
  else
    echo "Successfully freed port $PORT"
  fi
else
  echo "Port $PORT is already available"
fi

exit 0
