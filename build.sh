#!/bin/bash

# Exit on error
set -e

echo "Installing dependencies..."
npm install

echo "Building the application..."
npm run build

echo "Running database migrations..."
if [ "$NODE_ENV" = "production" ]; then
  echo "Skipping migrations in production as they should be run manually"
else
  npm run migration:run
fi

echo "Build completed successfully!"
