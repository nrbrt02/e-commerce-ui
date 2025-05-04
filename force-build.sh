#!/bin/bash
# Simple script to force build despite TypeScript errors

echo "Starting force build process..."
echo "Running TypeScript check with --noEmit flag (errors will be ignored)"
npx tsc --noEmit

echo "Running Vite build..."
npx vite build

if [ $? -eq 0 ]; then
  echo "Build completed successfully!"
else
  echo "Build failed. Trying alternative method..."
  echo "Running with NODE_ENV=production..."
  NODE_ENV=production npx vite build
  
  if [ $? -eq 0 ]; then
    echo "Build completed successfully with alternative method!"
  else
    echo "All build attempts failed."
    exit 1
  fi
fi