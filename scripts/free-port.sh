#!/bin/bash

# Script to check if port 3000 is in use and attempt to free it

check_port() {
  # Check if the port is in use
  if lsof -i :3000 > /dev/null; then
    echo "Port 3000 is currently in use"
    return 0 # true, port is in use
  else
    echo "Port 3000 is available"
    return 1 # false, port is not in use
  fi
}

free_port() {
  # Get the PID of the process using port 3000
  PID=$(lsof -t -i :3000)
  
  if [ -z "$PID" ]; then
    echo "No process found using port 3000"
    return 0
  fi
  
  echo "Found process with PID $PID using port 3000"
  
  # Attempt to kill the process
  echo "Attempting to terminate process..."
  kill -15 $PID
  
  # Wait a moment
  sleep 2
  
  # Check if process is still running
  if ps -p $PID > /dev/null; then
    echo "Process still running, attempting force kill..."
    kill -9 $PID
    sleep 1
  fi
  
  # Verify the port is now free
  if check_port; then
    echo "Failed to free port 3000"
    return 1
  else
    echo "Port 3000 is now available"
    return 0
  fi
}

# Main script execution
if check_port; then
  echo "Attempting to free port 3000..."
  free_port
else
  echo "Port 3000 is already available"
fi
